let vscode = require('vscode');

function askForCustomDependency() {
    var depPath;

    return vscode.window.showInputBox({prompt: 'Please type the dependency path'})
        .then(path => {
            depPath = path;
            
            return vscode.window.showInputBox({prompt: 'Please type the dependecy parameter name'})
                .then(param => {
                    return {
                        depPath: depPath,
                        depParam: param
                    }
                })                    
        })
}

function showListOfNetSuiteDependecies(list) {
    return vscode.window.showQuickPick(list);
}

exports.askForCustomDependency = askForCustomDependency;
exports.showListOfNetSuiteDependecies = showListOfNetSuiteDependecies;
