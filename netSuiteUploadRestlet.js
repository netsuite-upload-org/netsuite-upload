/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/file'], function (file) {
    function getFile(request) {
        var fullFileName = 'SuiteScripts' + request.fileName.split('\\').join('/');

        log.audit('Downloading file', fullFileName);

        var downloadFile = file.load({
            id: fullFileName
        });

        return downloadFile.getContents();
    }

    return {
        get: getFile
    }
});
