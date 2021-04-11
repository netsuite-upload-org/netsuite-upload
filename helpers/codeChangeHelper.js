let fs = require('fs');
let esprima = require('esprima');
let estraverse = require('estraverse');
let vscode = require('vscode');

function getCoords(fileContent) {
    var tree = esprima.parse(fileContent, { sourceType: 'module', tokens: true, range: true, loc: true });

    var coords = {
        depPath: null,
        depParam: null
    };

    estraverse.traverse(tree, {
        enter: function (node, parent) {

            if (parent && parent.type == 'CallExpression' && parent.callee.name == 'define') {
                if (node.type == 'ArrayExpression') {
                    coords.depPath = {
                        start : {
                            row: node.loc.start.line,
                            col: node.loc.start.column
                        },
                        end : {
                            row: node.loc.end.line,
                            col: node.loc.end.column
                        },
                        range: [node.range[0], node.range[1]]
                    };
                }

                if (node.type == 'ArrowFunctionExpression' || node.type == 'FunctionExpression') {
                    coords.depParam = {
                        start : {
                            row: node.loc.start.line,
                            col: node.loc.start.column
                        },
                        end : {
                            row: node.body.loc.start.line,
                            col: node.body.loc.start.column
                        },
                        range: [node.range[0], node.body.range[0]]
                    };
                }
            }
        }
    });

    return coords;
}

function createPosition(row, col) {
    return new vscode.Position(row, col);
}

function rangeFactory(start, end) {
    return new vscode.Range(start, end);
}

function textEditFactory(range, content) {
    return new vscode.TextEdit(range, content);
}

function editFactory (coords, content){
    var start = createPosition(coords.start.line, coords.start.char);
    var end = createPosition(coords.end.line, coords.end.char);
    var range = rangeFactory(start, end);
    
    return textEditFactory(range, content);
}

function workspaceEditFactory() {
    return new vscode.WorkspaceEdit();
}

function setEditFactory(uri, coords, content) {
    var workspaceEdit = workspaceEditFactory();
    var edit = editFactory(coords, content);

    workspaceEdit.set(uri, [edit]);
    return workspaceEdit;
}

function getDocument (vsEditor) {
    return typeof vsEditor.documentData !== 'undefined' ? vsEditor.documentData : vsEditor.document
}

async function editCurrentDocument(vsEditor, coords, content){
    var vsDocument = getDocument(vsEditor);
    var edit = setEditFactory(vsDocument.uri, coords, content);
    await vscode.workspace.applyEdit(edit);
}

function replaceStringRange(source, replacement, from, to) {
    return source.substring(0, from) + replacement + source.substring(to);
}

function getUpdatedFunctionParams(newDependecyParam, oldString) {
    let newString = oldString;
    
    if (oldString.indexOf('function') != -1) {
        let fromIndex = oldString.indexOf('(') + 1;
        let toIndex = oldString.indexOf(')');
        let oldParams = oldString.substring(fromIndex, toIndex);
        let newParams = oldParams.trim();
        newParams = newParams.length > 0 ? newParams + ', ' + newDependecyParam : newDependecyParam;
        
        newString = replaceStringRange(oldString, newParams, fromIndex, toIndex);
    }
    if (oldString.indexOf('=>') != -1) {
        let params = oldString.split("=>")[0].trim();

        if (params.indexOf('(') == -1) { // "param => "
            newString = '(' + params + ', ' + newDependecyParam + ') => ';
        } else {
            let fromIndex = oldString.indexOf('(') + 1;
            let toIndex = oldString.indexOf(')');
            let oldParams = oldString.substring(fromIndex, toIndex);
            let newParams = oldParams.trim();
            newParams = newParams.length > 0 ? newParams + ', ' + newDependecyParam : newDependecyParam;
        
            newString = replaceStringRange(oldString, newParams, fromIndex, toIndex);
        }
    }

    return newString;
}

function getUpdatedDepPath(newDependecyPath, oldString) {
    if (oldString) {
        let fromIndex = oldString.indexOf('[') + 1;
        let toIndex = oldString.indexOf(']');
        let oldPaths = oldString.substring(fromIndex, toIndex);
        let newPaths = oldPaths.trim();
        newPaths = newPaths.length > 0 ? newPaths + ", '" + newDependecyPath + "'" : "'" + newDependecyPath + "'";

        return replaceStringRange(oldString, newPaths, fromIndex, toIndex);
    } 
    
    return "['" + newDependecyPath + "']";
}

async function updateDocument(editor, startLine, startChar, endLine, endChar, content) {
    var editorCoords = {
        start : {
            line: startLine,
            char: startChar
        },
        end : {
            line: endLine,
            char: endChar
        }
    }
    
    await editCurrentDocument(editor, editorCoords, content);
}

exports.getCoords = getCoords;
exports.getUpdatedFunctionParams = getUpdatedFunctionParams;
exports.getUpdatedDepPath = getUpdatedDepPath;
exports.createPosition = createPosition;
exports.editCurrentDocument = editCurrentDocument;
exports.updateDocument = updateDocument;
