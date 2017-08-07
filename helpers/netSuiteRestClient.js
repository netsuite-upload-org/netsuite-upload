let vscode = require('vscode');
let RestClient = require('node-rest-client').Client;

function getRelativePath(absFilePath) {
    var rootDirectory = vscode.workspace.getConfiguration('netSuiteUpload')['rootDirectory'];
    if (rootDirectory) {
        return rootDirectory + absFilePath.slice(vscode.workspace.rootPath.length);
    } else {   
        return 'SuiteScripts' + absFilePath.slice(vscode.workspace.rootPath.length);
    }
}

function getFile(file, callback) {
    getData('file', file.fsPath, callback);
}

function getDirectory(directory, callback) {
    getData('directory', directory.fsPath, callback);
}

function getData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);
    
    var client = new RestClient();
    var args = {
        path: { name: relativeName },
        headers: {                
            "Content-Type": "application/json",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    client.get(baseRestletURL + '&type=' + type + '&name=${name}', args, function (data) {
        callback(data);
    });
}

function postFile(file, content, callback) {
    postData('file', file.fsPath, content, callback);
}

function postData(type, objectPath, content, callback) {
    var relativeName = getRelativePath(objectPath);
    
    var client = new RestClient();
    var args = {
        headers: {                
            "Content-Type": "application/json",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        },
        data: {
            type: 'file',
            name: relativeName,
            content: content
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    client.post(baseRestletURL, args, function (data) {
        callback(data);
    });
}

function deleteFile(file, callback) {
    deletetData('file', file.fsPath, callback);
}

function deletetData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);
    
    var client = new RestClient();
    var args = {
        path: { name: relativeName },
        headers: {                
            "Content-Type": "application/json",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    client.delete(baseRestletURL + '&type=' + type + '&name=${name}', args, function (data) {
        callback(data);
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;
