const vscode = require('vscode');
const superagent = require('superagent');
const crypto = require('crypto');
const path = require('path');
const OAuth = require('oauth-1.0a');
const compareVersions = require('compare-versions');
const url = require('url');
const BAD_VERSION_ERROR = {
    shortmessage: "You might need to update the vscodeExtensionRestlet.js RESTlet in NetSuite to the latest version."
};

function getRelativePath(absFilePath) {
    var rootDirectory = vscode.workspace.getConfiguration('netSuiteUpload').rootDirectory;
    var joinPath = absFilePath.slice(vscode.workspace.rootPath.length)
    if (rootDirectory) {
        if (joinPath) {
            joinPath = joinPath.split('/').slice(2).join('/')
        }
        return path.join(rootDirectory, joinPath);
    } else {
        return path.join('SuiteScripts', joinPath);
    }
}

function getFile(file, callback) {
    getData('file', file.fsPath, callback);
}

function getDirectory(directory, callback) {
    getData('directory', directory.fsPath, callback);
}

function getAuthHeader(method, data) {
    var nlAuth = vscode.workspace.getConfiguration('netSuiteUpload').authentication;
    var netSuiteOAuthKey = vscode.workspace.getConfiguration('netSuiteUpload').netSuiteKey;

    if (nlAuth && nlAuth.length > 0) {
        return vscode.workspace.getConfiguration('netSuiteUpload').authentication;
    }
    if (netSuiteOAuthKey && netSuiteOAuthKey.length > 0) {
        const opts = {
            consumer: {
                key: vscode.workspace.getConfiguration('netSuiteUpload').consumerToken,
                secret: vscode.workspace.getConfiguration('netSuiteUpload').consumerSecret
            },
            signature_method: 'HMAC-SHA256',
            realm: vscode.workspace.getConfiguration('netSuiteUpload').realm,
            hash_function: function (base_string, key) {
                return crypto.createHmac('sha256', key).update(base_string).digest('base64');
            }
        };

        const oauth = OAuth(opts);

        var token = {
            key: vscode.workspace.getConfiguration('netSuiteUpload').netSuiteKey,
            secret: vscode.workspace.getConfiguration('netSuiteUpload').netSuiteSecret
        };
        var restletUrl = vscode.workspace.getConfiguration('netSuiteUpload').restlet;
        var url_parts = url.parse(restletUrl, true);

        // Build up the data payload to sign.
        // qs will contain the script and deploy params.
        var qs = url_parts.query;
        var mergedData;
        if (method === 'GET' || method === 'DELETE') {
            // For GETs and DELETES, data ends up in the querystring.
            Object.assign(qs, data);
            mergedData = qs;
        } else {
            // for POSTs and DELETEs, the data isn't in the querystring
            // so we don't need it in the oauth signature.
            mergedData = qs;
        }
        var header = oauth.toHeader(oauth.authorize({
            method: method,
            url: restletUrl,
            data: mergedData
        }, token));

        console.log(header.Authorization);
        return header.Authorization;
    }

    throw "No authentication method found in settings.json (user or workspace settings).";
}

function doesRestletNeedUpdating(needsUpdating) {
    getRestletVersion((err, res) => {
        if (err || (compareVersions(res.body.restletVersion, "1.0.2") === -1)) {
            needsUpdating(true, err);
        } else {
            needsUpdating(false, err);
        }
    });
}

function getData(type, objectPath, callback) {
    doesRestletNeedUpdating(function (needsUpdating, err) {
        if (needsUpdating) {
            callback(BAD_VERSION_ERROR, err);
            return;
        }

        var relativeName = getRelativePath(objectPath);
        var data = {
            type: type,
            name: relativeName
        };
        superagent.get(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
            .set("Content-Type", "application/json")
            .set("Authorization", getAuthHeader('GET', data))
            .query(data)
            .end((err, res) => {
                callback(err, res);
            });
    });
}

function getRestletVersion(callback) {
    var data = {
        type: "version"
    };
    superagent.get(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
        .set("Content-Type", "application/json")
        .set("Authorization", getAuthHeader('GET', data))
        .query(data)
        .end((err, res) => {
            callback(err, res);
        });
}

function postFile(file, content, callback) {
    postData('file', file.fsPath, content, callback);

}

function postData(type, objectPath, content, callback) {
    doesRestletNeedUpdating(function (needsUpdating, err) {
        if (needsUpdating) {
            callback(BAD_VERSION_ERROR, err);
            return;
        }

        var relativeName = getRelativePath(objectPath);
        var data = {
            type: type,
            name: relativeName,
            content: content
        };
        superagent.post(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
            .set("Content-Type", "application/json")
            .set("Authorization", getAuthHeader('POST', data))
            .send(data)
            .end((err, res) => {
                callback(err, res);
            });
    });
}

function deleteFile(file, callback) {
    if (doesRestletNeedUpdating(callback)) return;
    deleteData('file', file.fsPath, callback);
}

function deleteData(type, objectPath, callback) {

    doesRestletNeedUpdating(function (needsUpdating, err) {
        if (needsUpdating) {
            callback(BAD_VERSION_ERROR, err);
            return;
        }
        var relativeName = getRelativePath(objectPath);
        var data = {
            type: type,
            name: relativeName
        };
        superagent.delete(vscode.workspace.getConfiguration('netSuiteUpload').restlet)
            .set("Content-Type", "application/json")
            .set("Authorization", getAuthHeader('DELETE', data))
            .query(data)
            .end((err, res) => {
                callback(err, res);
            });
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;
exports.getRestletVersion = getRestletVersion;