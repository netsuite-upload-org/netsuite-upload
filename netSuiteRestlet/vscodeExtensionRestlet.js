/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/file', 'N/search', 'N/record'], function (file, search, record) {

    function getFolderId(folderPath) {
        var foldersArray = folderPath.split('/');
        var folderName = foldersArray[foldersArray.length - 1];
        var filters = [];

        filters.push({
            name: 'name',
            operator: 'is',
            values: [folderName]
        });
        if (foldersArray.length == 1) filters.push({
            name: 'istoplevel',
            operator: 'is',
            values: true
        });

        if (foldersArray.length > 1) {
            var parentFolderArray = foldersArray.slice(0, -1);
            var parentId = getFolderId(parentFolderArray.join('/'));
            filters.push({
                name: 'parent',
                operator: 'anyof',
                values: [parentId]
            });
        }

        var folderSearch = search.create({
            type: search.Type.FOLDER,
            filters: filters
        });

        var folderId = null;
        folderSearch.run().each(function (result) {
            folderId = result.id;
            return false;
        });

        return folderId;
    }

    function createFolderIfNotExist(folderPath, parentId) {
        var folderArray = folderPath.split('/');
        var firstFolder = folderArray[0];
        var nextFolders = folderArray.slice(1);
        var filters = [];

        filters.push({
            name: 'name',
            operator: 'is',
            values: [firstFolder]
        });
        if (parentId) {
            filters.push({
                name: 'parent',
                operator: 'anyof',
                values: [parentId]
            });
        } else {
            filters.push({
                name: 'istoplevel',
                operator: 'is',
                values: true
            });
        }

        var folderSearch = search.create({
            type: search.Type.FOLDER,
            filters: filters
        });

        var folderId = null;
        folderSearch.run().each(function (result) {
            folderId = result.id;
            return false;
        });

        if (!folderId) {
            var folderRecord = record.create({
                type: record.Type.FOLDER
            });
            folderRecord.setValue({
                fieldId: 'name',
                value: firstFolder
            });
            folderRecord.setValue({
                fieldId: 'parent',
                value: parentId
            });
            folderId = folderRecord.save();
        }

        if (!nextFolders || nextFolders.length == 0) return folderId;

        return createFolderIfNotExist(nextFolders.join('/'), folderId);
    }

    function getInnerFolders(folderPath, folderId) {
        var folderSearch = search.create({
            type: search.Type.FOLDER,
            columns: ['name'],
            filters: [{
                name: 'parent',
                operator: 'is',
                values: [folderId]
            }]
        });

        var innerFolders = [{
            id: folderId,
            path: folderPath
        }];
        folderSearch.run().each(function (result) {
            innerFolders = innerFolders.concat(getInnerFolders(folderPath + '/' + result.getValue('name'), result.id));
            return true;
        });
        return innerFolders;
    }

    function getFilesInFolder(folderPath, folderId) {
        var fileSearch = search.create({
            type: search.Type.FOLDER,
            columns: ['file.internalid', 'file.name'],
            filters: [{
                name: 'internalid',
                operator: 'is',
                values: [folderId]
            }]
        });

        var files = [];
        fileSearch.run().each(function (result) {
            var fileId = result.getValue({
                name: 'internalid',
                join: 'file'
            });
            if (fileId) {
                var fileName = result.getValue({
                    name: 'name',
                    join: 'file'
                });
                var fileContent = file.load({
                    id: fileId
                }).getContents();

                files.push({
                    type: 'file',
                    name: fileName,
                    fullPath: folderPath + '/' + fileName,
                    content: fileContent
                });
            }
            return true;
        });

        // In case of empty folder return the folder name
        if (files.length == 0) {
            files.push({
                type: 'folder',
                fullPath: folderPath
            });
        }

        return files;
    }

    function getFile(relFilePath) {
        var fullFilePath = 'SuiteScripts' + relFilePath;

        var fileToReturn = file.load({
            id: fullFilePath
        });

        return [{
            name: fileToReturn.name,
            fullPath: fullFilePath,
            content: fileToReturn.getContents()
        }];
    }

    function getDirectory(relDirectoryPath) {
        var folderId = getFolderId('SuiteScripts' + relDirectoryPath);
        var folders = getInnerFolders(relDirectoryPath, folderId);
        var allFiles = [];

        folders.forEach(function (folder) {
            allFiles = allFiles.concat(getFilesInFolder(folder.path, folder.id));
        });
        return allFiles;
    }

    function updateFile(existingFile, content) {
        var fileObj = file.create({
            name: existingFile.name,
            fileType: existingFile.fileType,
            contents: content,
            description: existingFile.description,
            encoding: existingFile.encoding,
            folder: existingFile.folder,
            isOnline: existingFile.isOnline
        });
        fileObj.save();
    }

    function createFile(filePath, content) {
        var pathArray = filePath.split('/');
        var name = pathArray[pathArray.length - 1];
        var type = getFileType(name);
        var folder = createFolderIfNotExist(filePath.substring(0, filePath.lastIndexOf('/')));

        var fileObj = file.create({
            name: name,
            fileType: type,
            contents: content,
            folder: folder
        });
        fileObj.save();
    }

    function getFileType(fileName) {
        switch (file.extname(fileName).toLowerCase()) {
            case 'js':
                return file.Type.JAVASCRIPT;
            case 'bmp':
                return file.Type.BMPIMAGE;
            case 'csv':
                return file.Type.CSV;
            case 'xls', 'xlsx':
                return file.Type.EXCEL;
            case 'gif':
                return file.Type.GIFIMAGE;
            case 'gz':
                return file.Type.GZIP;
            case 'htm', 'html':
                return file.Type.HTMLDOC;
            case 'ico':
                return file.Type.ICON;
            case 'jpg', 'jpeg':
                return file.Type.JPGIMAGE;
            case 'json':
                return file.Type.JSON;
            case 'mp3':
                return file.Type.MP3;
            case 'mpg', 'mpeg':
                return file.Type.MPEGMOVIE;
            case 'mpp', 'mpt':
                return file.Type.MSPROJECT;
            case 'pdf':
                return file.Type.PDF;
            case 'txt':
                return file.Type.PLAINTEXT;
            case 'png':
                return file.Type.PNGIMAGE;
            case 'ps':
                return file.Type.POSTSCRIPT;
            case 'ppt', 'pptx':
                return file.Type.POWERPOINT;
            case 'qt', 'mov':
                return file.Type.QUICKTIME;
            case 'rtf':
                return file.Type.RTF;
            case 'scss':
                return file.Type.SCSS;
            case 'sms':
                return file.Type.SMS;
            case 'css':
                return file.Type.STYLESHEET;
            case 'svg':
                return file.Type.SVG;
            case 'tar':
                return file.Type.TAR;
            case 'tiff':
                return file.Type.TIFFIMAGE;
            case 'vsd', 'vsdx':
                return file.Type.VISIO;
            case 'doc', 'docx':
                return file.Type.WORD;
            case 'xml':
                return file.Type.XMLDOC;
            case 'xsd':
                return file.Type.XSD;
            case 'zip':
                return file.Type.ZIP;

            default:
                // This should cause an error upon upload.
                return 'UNKNOWN';
        }
    }

    function postFile(relFilePath, content) {
        var fullFilePath = 'SuiteScripts' + relFilePath;

        try {
            var loadedFile = file.load({
                id: fullFilePath
            });
            updateFile(loadedFile, content);
        } catch (e) {
            if (e.name == 'RCRD_DSNT_EXIST') {
                createFile(fullFilePath, content);
            } else {
                throw e;
            }
        }
    }

    function deleteFile(relFilePath) {
        var fullFilePath = 'SuiteScripts' + relFilePath;

        var fileObject = file.load({
            id: fullFilePath
        });
        file.delete({
            id: fileObject.id
        });
    }

    function getFunc(request) {
        var type = request.type; // directory, file

        var relPath = request.name.split(path.sep).join('/');
        // TODO: fix request.name == EMPTY STRING

        if (type === 'file') {
            return getFile(relPath);
        }
        if (type === 'directory') {
            return getDirectory(relPath);
        }
    }

    function postFunc(request) {
        var relPath = request.name.split(path.sep).join('/');

        postFile(relPath, request.content);
    }

    function deleteFunc(request) {
        var relPath = request.name.split(path.sep).join('/');

        deleteFile(relPath);
    }

    return {
        get: getFunc,
        post: postFunc,
        delete: deleteFunc
    }
});