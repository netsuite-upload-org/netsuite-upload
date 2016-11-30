let vscode = require('vscode');
let nsRestClient = require('../helpers/netSuiteRestClient');
let fs = require('fs');
let path = require('path');

function hasError(data) {
    if (data.error) {
        var errorMessage = JSON.parse(data.error.message);
        vscode.window.showErrorMessage(errorMessage.message);
        return true;
    }
    return false;
}

function downloadFileFromNetSuite(file) {
    nsRestClient.getFile(file, function(data) {
        if (hasError(data)) return;
        
        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        
        fs.writeFile(file.fsPath, data[0].content.toString());
        vscode.window.showInformationMessage('File "' + relativeFileName + '" downloaded.');
    });
}

function previewFileFromNetSuite(file) {
    nsRestClient.getFile(file, function(data) {
        if (hasError(data)) return;
        
        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        var tempFolder = vscode.workspace.getConfiguration('netSuiteUpload')['tempFolder'];
        var filePathArray = (relativeFileName.split('.')[0] + '.preview.' + relativeFileName.split('.')[1]).split('\\');
        var newPreviewFile = tempFolder + '\\' + filePathArray[filePathArray.length-1];

        fs.writeFile(newPreviewFile, data[0].content.toString());

        var nsFile = vscode.Uri.file(newPreviewFile);
        vscode.commands.executeCommand('vscode.diff', file, nsFile, 'Local <--> NetSuite');
    });
}

function downloadDirectoryFromNetSuite(directory) {
    nsRestClient.getDirectory(directory, function(data) {
        // TODO: process invalid folder

        data.forEach(function(file) {
            var fullFilePath = vscode.workspace.rootPath + file.fullPath.split('/').join('\\');

            createDirectoryIfNotExist(fullFilePath);
            fs.writeFile(fullFilePath, file.content.toString());
        });

        vscode.window.showInformationMessage('Files successfully downloaded.');
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

exports.downloadFileFromNetSuite = downloadFileFromNetSuite;
exports.previewFileFromNetSuite = previewFileFromNetSuite;
exports.downloadDirectoryFromNetSuite = downloadDirectoryFromNetSuite;
