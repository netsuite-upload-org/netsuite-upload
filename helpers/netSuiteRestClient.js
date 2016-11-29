let vscode = require('vscode');
let RestClient = require('node-rest-client').Client;

function getRelativePath(absFilePath) {
    return absFilePath.slice(vscode.workspace.rootPath.length);
}

function getFile(file, callback) {
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
        callback(data);
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
