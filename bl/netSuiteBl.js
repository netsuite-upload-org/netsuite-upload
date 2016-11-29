let vscode = require('vscode');
let nsRestClient = require('../helpers/netSuiteRestClient');
let fs = require('fs');

function downloadFileFromNetSuite(file) {
    nsRestClient.getFile(file, function(data) {
        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        
        fs.writeFile(file.fsPath, data.toString());
        vscode.window.showInformationMessage('File "' + relativeFileName + '" downloaded.');
    });
}

function previewFileFromNetSuite(file) {
    nsRestClient.getFile(file, function(data) {
        var relativeFileName = nsRestClient.getRelativePath(file.fsPath);
        var tempFolder = vscode.workspace.getConfiguration('netSuiteUpload')['tempFolder'];
        var filePathArray = (relativeFileName.split('.')[0] + '.preview.' + relativeFileName.split('.')[1]).split('\\');
        var newPreviewFile = tempFolder + '\\' + filePathArray[filePathArray.length-1];

        fs.writeFile(newPreviewFile, data.toString());

        var nsFile = vscode.Uri.file(newPreviewFile);
        vscode.commands.executeCommand('vscode.diff', file, nsFile, 'Local <--> NetSuite');
    });
}

exports.downloadFileFromNetSuite = downloadFileFromNetSuite;
exports.previewFileFromNetSuite = previewFileFromNetSuite;
