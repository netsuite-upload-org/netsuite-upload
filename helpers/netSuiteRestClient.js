/*jshint esversion: 6 */

let vscode = require('vscode');
let RestClient = require('node-rest-client').Client;
let OAuth = require('oauth-1.0a');
let crypto = require('crypto');
let url = require('url');

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
    if (oldAuth && oldAuth.length > 0) {
        return {
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload').authentication,
            "Content-Type": "application/json"
        };
    } else if (newAuth && newAuth.length > 0) {
        var oauth = OAuth({
            consumer: {
                key: vscode.workspace.getConfiguration('netSuiteUpload').consumerToken,
                secret: vscode.workspace.getConfiguration('netSuiteUpload').consumerSecret
            },
            signature_method: 'HMAC-SHA256',
            hash_function: function (base_string, key) {
                return crypto.createHmac('sha256', key).update(base_string).digest('base64');
            }
        });
        var token = {
            key: vscode.workspace.getConfiguration('netSuiteUpload').netSuiteKey,
            secret: vscode.workspace.getConfiguration('netSuiteUpload').netSuiteSecret
        };
        var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
        var headerWithRealm = oauth.toHeader(oauth.authorize({
            url: baseRestletURL,
            method: 'POST'
        }, token));
        headerWithRealm.Authorization += ', realm="' + vscode.workspace.getConfiguration('netSuiteUpload').realm + '"';
        headerWithRealm["Content-Type"] = "application/json";
        return headerWithRealm;
    }
    return null;
}

function getData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);

    // node-rest-client doesn't want querystring params to be already in the URL if using the args.parameters.
    // So we need to strip them off and add them to args.
    var parsed_url = url.parse(vscode.workspace.getConfiguration('netSuiteUpload').restlet, true);

    var client = new RestClient();
    var args = {
        parameters: {
            "type": type,
            "name": relativeName,
            "script": parsed_url.query.script,
            "deploy": parsed_url.query.deploy
        },
        headers: getHttpHeaders()
    };

    // remove the url search and query components so we can re-form the URL without them.
    parsed_url.search = parsed_url.query = "";

    // reassemble the url
    var baseRestletUrl = url.format(parsed_url);

    client.get(baseRestletUrl, args, function (data, response) {
        console.log(data);
        console.log(response);
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
            type: type,
            name: relativeName,
            content: content
        }
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
    client.post(baseRestletURL, args, function (data, response) {
        console.log(data);
        console.log(response);
        callback(data);
    });
}

function deleteFile(file, callback) {
    deleteData('file', file.fsPath, callback);
}

function deleteData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);

    var client = new RestClient();
    var args = {
        path: {
            "type": type,
            "name": relativeName
        },
        headers: getHttpHeaders()
    };

    var baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
    client.delete(baseRestletURL + '&type=${type}&name=${name}', args, function (data, response) {
        console.log(data);
        console.log(response);
        callback(data);
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;