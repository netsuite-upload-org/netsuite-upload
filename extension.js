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

    let uploadFileDisposable = vscode.commands.registerCommand('extension.uploadFile', (file) => {

        // TODO:
        
    });
    context.subscriptions.push(uploadFileDisposable);

    
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
