var resourceConfig = require('./resource-config');
var response = function () {};
response.getData = function (res, customCode, description, data) {

    if (!res.statusCode) {
        var sysApiResponseCode = '500';
    } else {
        var sysApiResponseCode = res.statusCode;
    }
    if (!customCode) {
        var customCode = '400'; // custom status code
    }
    if (!description) {
        var description = ''; // custom status message
    }
    if (!data) {
        var respData = ''; // custom status message
    } else {
        var respData = data;
    }

    if (data != null) {
        data[0].status = sysApiResponseCode;
        data[0].message = responseCodeMessage(sysApiResponseCode);
        data[0].statusCode = customCode;
        data[0].description = customAppCode(customCode, description);
        res.json(data[0]);
    } else {
        var responseData = JSON.stringify({
            "status": sysApiResponseCode,
            "message": responseCodeMessage(sysApiResponseCode),
            "statusCode": customCode, //custom response code            
            "description": customAppCode(customCode, description),
            "data": ""
        });

        res.json(responseData);
    }
}
module.exports = response;

//custom application API Code/ message
function customAppCode(customCode, description) {
   /* for(var i=0;i<resourceConfig.transport.length;i++){
        if(customCode==resourceConfig.transport[i].statuscode){
            return resourceConfig.transport[i].desciption;
        }
    }*/
    switch (customCode) {
    case 1001:
        return (!description) ? 'Db error' : description;
        break;

    case 1002:
        return (!description) ? 'Ok' : description;
        break;

    case 1003:
        return (!description) ? 'Exception Occurred' : description;
        break;

    case 1004:
        return (!description) ? 'Request Not Found' : description;
        break;

    case 1005:
        return (!description) ? 'Data Unavailable' : description;
        break;

    case 1006:
        return (!description) ? 'Success' : description;
        break;

    case 1007:
        return (!description) ? 'Invalid Data' : description;
        break;

    case 1008:
        return (!description) ? 'Failed' : description;
        break;
    }
}

function responseCodeMessage(code) {
    switch (code) {
    case 100:
        return 'Continue';
        break;

    case 101:
        return 'Switching Protocols';
        break;

    case 200:
        return 'Ok';
        break;

    case 201:
        return 'Created';
        break;

    case 202:
        return 'Accepted';
        break;

    case 203:
        return 'Non-Authoritative Information';
        break;

    case 204:
        return 'No Content';
        break;

    case 205:
        return 'Reset Content';
        break;

    case 206:
        return 'Partial Content';
        break;

    case 207:
        return 'Multi-Status';
        break;

    case 300:
        return 'Multiple Choices';
        break;

    case 301:
        return 'Moved Permanently';
        break;

    case 302:
        return 'Found';
        break;

    case 303:
        return 'See Other';
        break;

    case 304:
        return 'Not Modified';
        break;

    case 305:
        return 'Use Proxy';
        break;

    case 306:
        return 'Reserved';
        break;

    case 307:
        return 'Temporary Redirect';
        break;

    case 400:
        return 'Bad Request';
        break;

    case 401:
        return 'Unauthorized';
        break;

    case 402:
        return 'Payment Required';
        break;

    case 403:
        return 'Forbidden';
        break;

    case 404:
        return 'Not Found';
        break;

    case 405:
        return 'Method Not Allowed';
        break;

    case 406:
        return 'Not Acceptable';
        break;

    case 407:
        return 'Proxy Authentication';
        break;

    case 408:
        return 'Request Timeout';
        break;

    case 409:
        return 'Conflict';
        break;

    case 410:
        return 'Gone';
        break;

    case 411:
        return 'Length Required';
        break;

    case 412:
        return 'Precondition Failed';
        break;

    case 413:
        return 'Request Entity Too Large';
        break;

    case 414:
        return 'Request-URI Too Long';
        break;

    case 415:
        return 'Unsupported Media Type';
        break;

    case 416:
        return 'Requested Range Not Satisfiable';
        break;

    case 417:
        return 'Expectation Failed';
        break;

    case 422:
        return 'Unprocessable Entity';
        break;

    case 423:
        return 'Locked';
        break;

    case 424:
        return 'Failed Dependency';
        break;

    case 500:
        return 'Internal Server Error';
        break;

    case 501:
        return 'Not Implemented';
        break;

    case 502:
        return 'Bad Gateway';
        break;

    case 503:
        return 'Service Unavailable';
        break;

    case 504:
        return 'Gateway Timeout';
        break;

    case 505:
        return 'HTTP Version Not Supported';
        break;

    case 507:
        return 'Insufficient Storage';
        break;

    }
}