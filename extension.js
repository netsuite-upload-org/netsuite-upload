let vscode = require('vscode');
let netSuiteBl = require('./bl/netSuiteBl');

function activate(context) {
    console.log('Extension "netsuite-upload" is now active!');

    let noProjectOpenedErrorMessage = 'No project is opened. Please open root folder. (SuiteScripts)';
    let noFileSelectedErrorMessage = 'No file selected. Please right-click the file and select action from context menu.';

    let downloadFileDisposable = vscode.commands.registerCommand('netsuite-upload.downloadFile', (file) => {
        if (!file) {
            vscode.window.showErrorMessage(noFileSelectedErrorMessage);
            return;
        }

        // Root SuiteScript folder has to be opened
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage(noProjectOpenedErrorMessage);
            return;
        }

        netSuiteBl.downloadFileFromNetSuite(file);
    });
    context.subscriptions.push(downloadFileDisposable);

    let previewFileDisposable = vscode.commands.registerCommand('netsuite-upload.previewFile', (file) => {
        if (!file) {
            vscode.window.showErrorMessage(noFileSelectedErrorMessage);
            return;
        }

        // Root SuiteScript folder has to be opened
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage(noProjectOpenedErrorMessage);
            return;
        }

        netSuiteBl.previewFileFromNetSuite(file);
    });
    context.subscriptions.push(previewFileDisposable);

    let uploadFileDisposable = vscode.commands.registerCommand('netsuite-upload.uploadFile', (file) => {
        // Root SuiteScript folder has to be opened
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage(noProjectOpenedErrorMessage);
            return;
        }

        if (!file || !Object.keys(file).length) {
            if (!vscode.window.activeTextEditor && !vscode.window.activeTextEditor.document.uri) {
                vscode.window.showErrorMessage(noFileSelectedErrorMessage);
                return;
            }
            else {
                file = vscode.window.activeTextEditor.document.uri;
            }
        }

        netSuiteBl.uploadFileToNetSuite(file);
    });
    context.subscriptions.push(uploadFileDisposable);

    let deleteFileDisposable = vscode.commands.registerCommand('netsuite-upload.deleteFile', (file) => {
        if (!file) {
            vscode.window.showErrorMessage(noFileSelectedErrorMessage);
            return;
        }

        // Root SuiteScript folder has to be opened
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage(noProjectOpenedErrorMessage);
            return;
        }

        netSuiteBl.deleteFileInNetSuite(file);
    });
    context.subscriptions.push(deleteFileDisposable);

    let downloadFolderDisposable = vscode.commands.registerCommand('netsuite-upload.downloadFolder', (directory) => {
        if (!directory) {
            vscode.window.showErrorMessage('No directory selected.');
            return;
        }

        // Root SuiteScript folder has to be opened
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage(noProjectOpenedErrorMessage);
            return;
        }

        netSuiteBl.downloadDirectoryFromNetSuite(directory);
    });
    context.subscriptions.push(downloadFolderDisposable);

    let addCustomDependencyDisposable = vscode.commands.registerCommand('netsuite-upload.addCustomDependency', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is opened.');
            return;
        }

        netSuiteBl.addCustomDependencyToActiveFile(editor);
    });
    context.subscriptions.push(addCustomDependencyDisposable);

    let addNSDependencyDisposable = vscode.commands.registerCommand('netsuite-upload.addNSDependency', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is opened.');
            return;
        }

        netSuiteBl.addNetSuiteDependencyToActiveFile(editor);
    });
    context.subscriptions.push(addNSDependencyDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
