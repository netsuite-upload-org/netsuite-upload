/*jshint esversion: 6 */

let vscode = require('vscode');
let RestClient = require('node-rest-client').Client;
let OAuth = require('oauth-1.0a');
let crypto  = require('crypto');

function getRelativePath(absFilePath) {
    return absFilePath.slice(vscode.workspace.rootPath.length);
}

function getFile(file, callback) {
    getData('file', file.fsPath, callback);
}

function getDirectory(directory, callback) {
    getData('directory', directory.fsPath, callback);
}

function getHttpHeaders() {

    var oldAuth = vscode.workspace.getConfiguration('netSuiteUpload').authentication;
    var newAuth = vscode.workspace.getConfiguration('netSuiteUpload').netSuiteKey;
    if (oldAuth && oldAuth.length > 0)
    {
        return {
            "Authorization" : vscode.workspace.getConfiguration('netSuiteUpload').authentication,
            "Content-Type" : "application/json"
        };
    }
    else if (newAuth && newAuth.length > 0 ) {
        var oauth = OAuth({
            consumer: {
                key: vscode.workspace.getConfiguration('netSuiteUpload').consumerToken,
                secret: vscode.workspace.getConfiguration('netSuiteUpload').consumerSecret
            },
            signature_method: 'HMAC-SHA256',
            hash_function: function(base_string, key) {
                return crypto.createHmac('sha256', key).update(base_string).digest('base64');
            }
        });
        var token = {
            key: vscode.workspace.getConfiguration('netSuiteUpload').netSuiteKey,
            secret: vscode.workspace.getConfiguration('netSuiteUpload').netSuiteSecret
        };
        var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
        var headerWithRealm  = oauth.toHeader(oauth.authorize({ url: baseRestletURL, method: 'POST' }, token));
        headerWithRealm.Authorization += ', realm="' + vscode.workspace.getConfiguration('netSuiteUpload').realm + '"';
        headerWithRealm["Content-Type"] = "application/json";
        return headerWithRealm;
    }
    return null;
}

function getData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);

    var client = new RestClient();
    var args = {
        path: { name: relativeName },
        headers: getHttpHeaders()
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;

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
        headers: getHttpHeaders(),
        data: {
            type: 'file',
            name: relativeName,
            content: content
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
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
        headers: getHttpHeaders()
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
    client.delete(baseRestletURL + '&type=' + type + '&name=${name}', args, function (data) {
        callback(data);
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;
