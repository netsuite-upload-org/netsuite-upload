/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */

define(['N/file', 'N/search', 'N/record', 'N/log', 'N/error'], function (
  file,
  search,
  record,
  log,
  error
) {

  const RESTLET_VERSION = '1.0.2';
  const RESTLET_NAME = 'vscodeExtensionRestlet.js';


  var fileMap = {};
  fileMap.appcache = file.Type.APPCACHE;
  fileMap.dwf = file.Type.AUTOCAD;
  fileMap.dwg = file.Type.AUTOCAD;
  fileMap.dxf = file.Type.AUTOCAD;
  fileMap.dwf = file.Type.AUTOCAD;
  fileMap.dwt = file.Type.AUTOCAD;
  fileMap.plt = file.Type.AUTOCAD;
  fileMap.bmp = file.Type.BMPIMAGE;
  fileMap.cer = file.Type.CERTIFICATE;
  fileMap.crl = file.Type.CERTIFICATE;
  fileMap.crt = file.Type.CERTIFICATE;
  fileMap.csr = file.Type.CERTIFICATE;
  fileMap.der = file.Type.CERTIFICATE;
  fileMap.key = file.Type.CERTIFICATE;
  fileMap.p10 = file.Type.CERTIFICATE;
  fileMap.p12 = file.Type.CERTIFICATE;
  fileMap.p7b = file.Type.CERTIFICATE;
  fileMap.p7c = file.Type.CERTIFICATE;
  fileMap.p7r = file.Type.CERTIFICATE;
  fileMap.p8 = file.Type.CERTIFICATE;
  fileMap.pem = file.Type.CERTIFICATE;
  fileMap.pfx = file.Type.CERTIFICATE;
  fileMap.spc = file.Type.CERTIFICATE;
  fileMap.config = file.Type.CONFIG;
  fileMap.csv = file.Type.CSV;
  fileMap.xls = file.Type.EXCEL;
  fileMap.xlsx = file.Type.EXCEL;
  fileMap.swf = file.Type.FLASH;
  fileMap.ftl = file.Type.FREEMARKER;
  fileMap.gif = file.Type.GIFIMAGE;
  fileMap.gz = file.Type.GZIP;
  fileMap.htm = file.Type.HTMLDOC;
  fileMap.html = file.Type.HTMLDOC;
  fileMap.shtml = file.Type.HTMLDOC;
  fileMap.ico = file.Type.ICON;
  fileMap.icon = file.Type.ICON;
  fileMap.js = file.Type.JAVASCRIPT;
  fileMap.jpg = file.Type.JPGIMAGE;
  fileMap.jpeg = file.Type.JPGIMAGE;
  fileMap.json = file.Type.JSON;
  fileMap.eml = file.Type.MESSAGERFC;
  fileMap.mp3 = file.Type.MP3;
  fileMap.mpg = fileMap.mpeg = file.Type.MPEGMOVIE;
  fileMap.mpp = fileMap.mpt = file.Type.MSPROJECT;
  fileMap.pdf = file.Type.PDF;
  fileMap.pjpeg = file.Type.PJPGIMAGE;
  fileMap.prn = fileMap.txt = fileMap.log = fileMap.htc = fileMap.sql = fileMap.ts = file.Type.PLAINTEXT;
  fileMap.png = file.Type.PNGIMAGE;
  fileMap.ps = fileMap.eps = file.Type.POSTSCRIPT;
  fileMap.ppt = fileMap.pptx = file.Type.POWERPOINT;
  fileMap.qt = fileMap.mov = file.Type.QUICKTIME;
  fileMap.rtf = file.Type.RTF;
  fileMap.scss = file.Type.SCSS;
  fileMap.sms = file.Type.SMS;
  fileMap.css = file.Type.STYLESHEET;
  fileMap.svg = file.Type.SVG;
  fileMap.tar = fileMap.tgz = fileMap.tbz = file.Type.TAR;
  fileMap.tif = fileMap.tiff = file.Type.TIFFIMAGE;
  fileMap.vsd = fileMap.vsdx = file.Type.VISIO;
  fileMap.ssp = file.Type.WEBAPPPAGE;
  fileMap.ss = file.Type.WEBAPPSCRIPT;
  fileMap.doc = fileMap.docx = fileMap.dot = file.Type.WORD;
  fileMap.xml = file.Type.XMLDOC;
  fileMap.xsd = file.Type.XSD;
  fileMap.zip = fileMap.lzh = fileMap.lha = file.Type.ZIP;

  function throwError(message) {
    var errorObj = error.create({
      name: RESTLET_NAME,
      message: message,
      notifyOff: false
    });
    log.error(errorObj);
    throw (errorObj);
  }

  function getFolderId(folderPath) {
    var foldersArray = folderPath.split('/');
    var folderName = foldersArray[foldersArray.length - 1];
    var filters = [];

    filters.push({
      name: 'name',
      operator: 'is',
      values: [folderName]
    });
    if (foldersArray.length == 1)
      filters.push({
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
      innerFolders = innerFolders.concat(
        getInnerFolders(folderPath + '/' + result.getValue('name'), result.id)
      );
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
        var fileContent = file
          .load({
            id: fileId
          })
          .getContents();

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
    var fullFilePath = relFilePath;

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
    var folderId = getFolderId(relDirectoryPath);
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
    var fileType = getFileType(name);
    var folder = createFolderIfNotExist(
      filePath.substring(0, filePath.lastIndexOf('/'))
    );

    var fileObj = file.create({
      name: name,
      fileType: fileType,
      contents: content,
      folder: folder
    });
    fileObj.save();
  }

  function getFileType(fileName) {
    var extension = fileName
      .split('.')
      .pop()
      .toLowerCase();

    var fileType = fileMap[extension];
    if (fileType === null)
      return "UNKNOWN";
    return fileType;
  }

  function postFile(relFilePath, content) {
    var fullFilePath = relFilePath;

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
    var fullFilePath = relFilePath;

    var fileObject = file.load({
      id: fullFilePath
    });
    file.delete({
      id: fileObject.id
    });
  }

  function getFunc(request) {
    var type = request.type;
    if (type == null || type.length === 0) {
      throwError("type parameter must be one of 'file', 'directory' or 'version'");
      return;
    }

    if (type === 'version') {
      return {
        restletVersion: RESTLET_VERSION
      };
    }

    var name = request.name;
    if (name == null || name.length === 0) {
      throwError("'name' parameter must be set when type is 'file' or 'directory'. It is the file or directory name.");
      return;
    }

    var relPath = request.name.replace(/\\/g, '/');

    if (type === 'file') {
      return getFile(relPath);
    }
    if (type === 'directory') {
      return getDirectory(relPath);
    }
  }

  function postFunc(request) {
    var relPath = request.name.replace(/\\/g, '/');
    postFile(relPath, request.content);
    return true;
  }

  function deleteFunc(request) {
    var relPath = request.name.replace(/\\/g, '/');
    deleteFile(relPath);
    return true;
  }

  return {
    get: getFunc,
    post: postFunc,
    delete: deleteFunc
  };
});
