function getSuiteScriptDependecies() {
    return [
        { path: 'N/auth',               param: 'auth' },
        { path: 'N/cache',              param: 'cache' },
        { path: 'N/config',             param: 'config' },
        { path: 'N/crypto',             param: 'crypto' },
        { path: 'N/currency',           param: 'currency' },
        { path: 'N/currentRecord',      param: 'currentRecord' },
        { path: 'N/email',              param: 'email' },
        { path: 'N/encode',             param: 'encode' },
        { path: 'N/error',              param: 'error' },
        { path: 'N/file',               param: 'file' },
        { path: 'N/format',             param: 'format' },
        { path: 'N/http',               param: 'http' },
        { path: 'N/https',              param: 'https' },
        { path: 'N/log',                param: 'log' },
        { path: 'N/plugin',             param: 'plugin' },
        { path: 'N/portlet',            param: 'portlet' },
        { path: 'N/record',             param: 'record' },
        { path: 'N/redirect',           param: 'redirect' },
        { path: 'N/render',             param: 'render' },
        { path: 'N/runtime',            param: 'runtime' },
        { path: 'N/search',             param: 'search' },
        { path: 'N/sftp',               param: 'sftp' },
        { path: 'N/sso',                param: 'sso' },
        { path: 'N/task',               param: 'task' },
        { path: 'N/transaction',        param: 'transaction' },
        { path: 'N/ui/dialog',          param: 'dialog' },
        { path: 'N/ui/message',         param: 'message' },
        { path: 'N/ui/serverWidget',    param: 'serverWidget' },
        { path: 'N/url',                param: 'url' },
        { path: 'N/util',               param: 'util' },
        { path: 'N/workflow',           param: 'workflow' },
        { path: 'N/xml',                param: 'xml' }
    ];
}

exports.getSuiteScriptDependecies = getSuiteScriptDependecies;
