let vscode = require('vscode');
let fs = require('fs');
let path = require('path');
let nsRestClient = require('../helpers/netSuiteRestClient');
let codeChangeHelper = require('../helpers/codeChangeHelper');
let uiHelper = require('../helpers/uiHelper');
let netsuiteList = require('../helpers/netsuiteList');
let _ = require('underscore');

function getRestletVersion() {
    nsRestClient.getRestletVersion(function (err, res) {
        if (hasNetSuiteError("Could not determine the version of the RESTlet deployed to NetSuite. Are you sure you have uploaded the most recent version of the RESTlet 'vscodeExtensionRestlet.js'?", err, res)) {
            return;
        }
        vscode.window.showInformationMessage('RESTlet version is ' + res.body.restletVersion);
    });
}

function downloadFileFromNetSuite(file) {
    nsRestClient.getFile(file, function (err, res) {
        if (hasNetSuiteError("ERROR downloading file", err, res)) {
            return;
        }

        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        fs.writeFile(file.fsPath, res.body[0].content);
        vscode.window.showInformationMessage('SUCCESS! File "' + relativeFileName + '" downloaded.');
    });
}

function uploadFileToNetSuite(file) {
    var fileContent = fs.readFileSync(file.fsPath, 'utf8');

    nsRestClient.postFile(file, fileContent, function (err, res) {
        if (hasNetSuiteError("ERROR uploading file", err, res)) {
            return;
        }

        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        vscode.window.showInformationMessage('SUCCESS! File "' + relativeFileName + '" uploaded.');
    });
}

function hasNetSuiteError(custommessage, err, response) {
    if (err) {
        var get = function(obj, key) {
            return key.split(".").reduce(function(o, x) {
                return (typeof o == "undefined" || o === null) ? o : o[x];
            }, obj);
        };

        var msg = custommessage;
        var items = [];
        if (response && response.body && response.body.error) {
            // The body of the response may contain a JSON object containing a NetSuite-specific
            // message. We'll parse and display that in addition to the HTTP message.
            //if (response.headers.)
            items = [
                "NetSuite Error:",
                "HTTP Status: " + get(err, 'status'),
                "HTTP Error: " + get(err, 'message'),
                "NS Error: " + get(response.body.error, 'code'),
                "NS Message: " + get(response.body.error, 'message'),
                "NS Type: " + get(response.body.error, 'message.type'),
                "NS Name: " + get(response.body.error, 'message.name'),
                "NS Stack: " + get(response.body.error, 'message.stack')
            ];
        } else if (err.status && err.stack) {
            items = [
                "Other Error:",
                "HTTP Status: " + get(err, 'status'),
                "HTTP Error: " + get(err, 'message'),
                "HTTP Stack:" + get(err, 'stack')
            ];
        }
        var errormessage = msg + " " + items.join("  ");
        console.log(err);
        console.log(errormessage);
        vscode.window.showErrorMessage(errormessage);
        return true;
    }
    return false;
}

function deleteFileInNetSuite(file) {
    nsRestClient.deleteFile(file, function (err, res) {
        if (hasNetSuiteError("ERROR deleting file", err, res)) {
            return;
        }

        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        vscode.window.showInformationMessage('SUCCESS! Deleted file "' + relativeFileName + '".');
    });
}

function previewFileFromNetSuite(file) {
    nsRestClient.getFile(file, function (err, res) {
        if (hasNetSuiteError("ERROR downloading file!", err, res)) {
            return;
        }

        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        var tempFolder = vscode.workspace.getConfiguration('netSuiteUpload').tempFolder;
        var filePathArray = (relativeFileName.split('.')[0] + '.preview.' + relativeFileName.split('.')[1]).split(path.sep);
        var newPreviewFile = path.join(tempFolder, filePathArray[filePathArray.length - 1]);

        fs.writeFile(newPreviewFile, res.body[0].content);

        var nsFile = vscode.Uri.file(newPreviewFile);
        vscode.commands.executeCommand('vscode.diff', file, nsFile, 'Local <--> NetSuite');
    });
}

function downloadDirectoryFromNetSuite(directory) {
    nsRestClient.getDirectory(directory, function (err, res) {
        if (hasNetSuiteError("ERROR downloading directory!", err, res)) {
            return;
        }

        res.body.forEach(function (file) {
            var fullFilePath = path.join(vscode.workspace.rootPath, file.fullPath.split('/').join(path.sep));

            createDirectoryIfNotExist(fullFilePath + (file.type == 'folder' ? path.sep + '_' : ''));

            if (file.type == 'file') {
                fs.writeFile(fullFilePath, file.content);
            }
        });

        vscode.window.showInformationMessage('SUCCESS: Downloaded ' + res.body.length + ' file(s).');
    });
}

function createDirectoryIfNotExist(filePath) {
    var dirname = path.dirname(filePath);

    if (fs.existsSync(dirname)) {
        return true;
    }

    createDirectoryIfNotExist(dirname);
    fs.mkdirSync(dirname);
}

function addCustomDependencyToActiveFile(editor) {
    uiHelper.askForCustomDependency()
        .then(values => {
            addDependency(editor, values.depPath, values.depParam);
        });
}

function addNetSuiteDependencyToActiveFile(editor) {
    let netsuiteLibs = netsuiteList.getSuiteScriptDependecies();

    uiHelper.showListOfNetSuiteDependecies(_.pluck(netsuiteLibs, 'path'))
        .then(value => {
            var depRecord = _.findWhere(netsuiteLibs, {
                path: value
            });
            addDependency(editor, depRecord.path, depRecord.param);
        });
}

function addDependency(editor, pathText, paramText) {
    let docContent = editor.document.getText();
    let coords = codeChangeHelper.getCoords(docContent);
    let oldParamsString = docContent.substring(coords.depParam.range[0], coords.depParam.range[1]);

    let newParamsString = codeChangeHelper.getUpdatedFunctionParams(paramText, oldParamsString);
    let newPathArrayString = codeChangeHelper.getUpdatedDepPath(pathText,
        coords.depPath ? docContent.substring(coords.depPath.range[0], coords.depPath.range[1]) : null);

    if (coords.depPath) {
        codeChangeHelper.updateDocument(editor, coords.depParam.start.row - 1, coords.depParam.start.col,
            coords.depParam.end.row - 1, coords.depParam.end.col, newParamsString);

        codeChangeHelper.updateDocument(editor, coords.depPath.start.row - 1, coords.depPath.start.col,
            coords.depPath.end.row - 1, coords.depPath.end.col, newPathArrayString);
    } else { // Path array not defined
        codeChangeHelper.updateDocument(editor, coords.depParam.start.row - 1, coords.depParam.start.col,
            coords.depParam.end.row - 1, coords.depParam.end.col, newPathArrayString + ', ' + newParamsString);
    }
}

exports.downloadFileFromNetSuite = downloadFileFromNetSuite;
exports.previewFileFromNetSuite = previewFileFromNetSuite;
exports.downloadDirectoryFromNetSuite = downloadDirectoryFromNetSuite;
exports.uploadFileToNetSuite = uploadFileToNetSuite;
exports.deleteFileInNetSuite = deleteFileInNetSuite;
exports.addCustomDependencyToActiveFile = addCustomDependencyToActiveFile;
exports.addNetSuiteDependencyToActiveFile = addNetSuiteDependencyToActiveFile;
exports.getRestletVersion = getRestletVersion;