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

    // Support for Oath authentication
    if (!args.headers.Authorization) {    
        var oauth = OAuth({
            consumer: {
                key: vscode.workspace.getConfiguration('netSuiteUpload')['netsuite-key'],
                secret: vscode.workspace.getConfiguration('netSuiteUpload')['netsuite-secret']
            },
            signature_method: 'HMAC-SHA1',
            hash_function: function(base_string, key) {
                return crypto.createHmac('sha1', key).update(base_string).digest('base64');
            }
        });
        var token = {
            key: vscode.workspace.getConfiguration('netSuiteUpload')['consumer-token'],
            secret: vscode.workspace.getConfiguration('netSuiteUpload')['consumer-secret']
        };
        var headerWithRealm = oauth.toHeader(oauth.authorize({ url: baseRestletURL, method: 'POST' }, token));
        headerWithRealm.Authorization += ', realm="' + vscode.workspace.getConfiguration('netSuiteUpload')['realm'] + '"';
        headerWithRealm['Content-Type'] = 'application/json';
        args.headers = headerWithRealm;
    }

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

    // Support for Oath authentication
    if (!args.headers.Authorization) {    
        var oauth = OAuth({
            consumer: {
                key: vscode.workspace.getConfiguration('netSuiteUpload')['netsuite-key'],
                secret: vscode.workspace.getConfiguration('netSuiteUpload')['netsuite-secret']
            },
            signature_method: 'HMAC-SHA1',
            hash_function: function(base_string, key) {
                return crypto.createHmac('sha1', key).update(base_string).digest('base64');
            }
        });
        var token = {
            key: vscode.workspace.getConfiguration('netSuiteUpload')['consumer-token'],
            secret: vscode.workspace.getConfiguration('netSuiteUpload')['consumer-secret']
        };
        var headerWithRealm = oauth.toHeader(oauth.authorize({ url: baseRestletURL, method: 'POST' }, token));
        headerWithRealm.Authorization += ', realm="' + vscode.workspace.getConfiguration('netSuiteUpload')['realm'] + '"';
        headerWithRealm['Content-Type'] = 'application/json';
        args.headers = headerWithRealm;
    }
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

    // Support for Oath authentication
    if (!args.headers.Authorization) {    
        var oauth = OAuth({
            consumer: {
                key: vscode.workspace.getConfiguration('netSuiteUpload')['netsuite-key'],
                secret: vscode.workspace.getConfiguration('netSuiteUpload')['netsuite-secret']
            },
            signature_method: 'HMAC-SHA1',
            hash_function: function(base_string, key) {
                return crypto.createHmac('sha1', key).update(base_string).digest('base64');
            }
        });
        var token = {
            key: vscode.workspace.getConfiguration('netSuiteUpload')['consumer-token'],
            secret: vscode.workspace.getConfiguration('netSuiteUpload')['consumer-secret']
        };
        var headerWithRealm = oauth.toHeader(oauth.authorize({ url: baseRestletURL, method: 'POST' }, token));
        headerWithRealm.Authorization += ', realm="' + vscode.workspace.getConfiguration('netSuiteUpload')['realm'] + '"';
        headerWithRealm['Content-Type'] = 'application/json';
        args.headers = headerWithRealm;
    }

    client.delete(baseRestletURL + '&type=' + type + '&name=${name}', args, function (data) {
        callback(data);
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;
