let vscode = require('vscode');
let netSuiteBl = require('./bl/netSuiteBl');

function activate(context) {
    console.log('Extension "netsuite-upload" is now active!');

    let downloadFileDisposable = vscode.commands.registerCommand('extension.downloadFile', (file) => {
        // Root SuiteScript folder has to be opened 
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage('No project is opened. Please open root folder. (SuiteScripts)');
            return;
        }
        
        netSuiteBl.downloadFileFromNetSuite(file);
    });
    context.subscriptions.push(downloadFileDisposable);

    let previewFileDisposable = vscode.commands.registerCommand('extension.previewFile', (file) => {
        // Root SuiteScript folder has to be opened 
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage('No project is opened. Please open root folder. (SuiteScripts)');
            return;
        }
        
        netSuiteBl.previewFileFromNetSuite(file);
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
