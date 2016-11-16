let vscode = require('vscode');
let RestClient = require('node-rest-client').Client;
let fs = require('fs');

function getRelativePath(absFilePath) {
    return absFilePath.slice(vscode.workspace.rootPath.length);
}

function downloadFileFromNetSuite(fullFileName) {
    var relativeFileName = getRelativePath(fullFileName);
    
    var client = new RestClient();
    var args = {
        path: { fileName: relativeFileName },
        headers: {                
            "Content-Type": "text/plain",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    client.get(baseRestletURL + '&fileName=${fileName}', args, function (data) {
        fs.writeFile(fullFileName, data.toString());
        vscode.window.showInformationMessage('File "' + relativeFileName + '" downloaded.');
    });
}

function previewFileFromNetSuite(file) {
    var relativeFileName = getRelativePath(file.fsPath);
    
    var client = new RestClient();
    var args = {
        path: { fileName: relativeFileName },
        headers: {                
            "Content-Type": "text/plain",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    client.get(baseRestletURL + '&fileName=${fileName}', args, function (data) {

        var tempFolder = vscode.workspace.getConfiguration('netSuiteUpload')['tempFolder'];
        var filePathArray = (relativeFileName.split('.')[0] + '.preview.' + relativeFileName.split('.')[1]).split('\\');
        var newPreviewFile = tempFolder + '\\' + filePathArray[filePathArray.length-1];

        fs.writeFile(newPreviewFile, data.toString());

        var nsFile = vscode.Uri.file(newPreviewFile);
        vscode.commands.executeCommand('vscode.diff', file, nsFile, 'Local <--> NetSuite');        
    });
}

function activate(context) {
    console.log('Extension "netsuite-upload" is now active!');

    let downloadFileDisposable = vscode.commands.registerCommand('extension.downloadFile', (file) => {
        // Root SuiteScript folder has to be opened 
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage('No project is opened. Please open root folder. (SuiteScripts)');
            return;
        }
        
        downloadFileFromNetSuite(file.fsPath);
    });
    context.subscriptions.push(downloadFileDisposable);

    let previewFileDisposable = vscode.commands.registerCommand('extension.previewFile', (file) => {
        // Root SuiteScript folder has to be opened 
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage('No project is opened. Please open root folder. (SuiteScripts)');
            return;
        }
        
        previewFileFromNetSuite(file);
    });
    context.subscriptions.push(previewFileDisposable);



    let uploadFileDisposable = vscode.commands.registerCommand('extension.uploadFile', (file) => {

        // TODO:
        
    });
    context.subscriptions.push(uploadFileDisposable);

    let downloadFolderDisposable = vscode.commands.registerCommand('extension.downloadFolder', (folder) => {

        // TODO:
        
    });
    context.subscriptions.push(downloadFolderDisposable);

    
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
