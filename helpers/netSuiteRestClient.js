/*jshint esversion: 6 */

const vscode = require('vscode');
const superagent = require('superagent');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

function getRelativePath(absFilePath) {
    return absFilePath.slice(vscode.workspace.rootPath.length);
}

function getFile(file, callback) {
    getData('file', file.fsPath, callback);
}

function getDirectory(directory, callback) {
    getData('directory', directory.fsPath, callback);
}

function getAuthHeader() {
    var oldAuth = vscode.workspace.getConfiguration('netSuiteUpload').authentication;
    var newAuth = vscode.workspace.getConfiguration('netSuiteUpload').netSuiteKey;
    if (oldAuth && oldAuth.length > 0) {

        return vscode.workspace.getConfiguration('netSuiteUpload').authentication;

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
        return headerWithRealm.Authorization;
    }
    return null;
}


function getData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);

    superagent.get(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
        .set("Content-Type", "application/json")
        .set("Authorization", getAuthHeader())
        .query({
            type: type,
            name: relativeName
        })
        .end((err, res) => {
            callback(err, res);
        });
}

function postFile(file, content, callback) {
    postData('file', file.fsPath, content, callback);
}

function postData(type, objectPath, content, callback) {
    var relativeName = getRelativePath(objectPath);

    superagent.post(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
        .set("Content-Type", "application/json")
        .set("Authorization", getAuthHeader())
        .query({
            type: type,
            name: relativeName,
            content: content
        })
        .end((err, res) => {
            callback(err, res);
        });
}

function deleteFile(file, callback) {
    deleteData('file', file.fsPath, callback);
}

function deleteData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);

    superagent.delete(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
        .set("Content-Type", "application/json")
        .set("Authorization", getAuthHeader())
        .query({
            type: type,
            name: relativeName
        })
        .end((err, res) => {
            callback(err, res);
        });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;