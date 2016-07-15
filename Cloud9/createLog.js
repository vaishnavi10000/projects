var fs=require('fs');
var createLog = function () {};
createLog.getLog = function (title, path, reques, startTime, respon, endTime) {
    var log = {
        "reques": reques,
        "startTime": startTime,
        "response": respon,
        "endTime": endTime
    }
    var reponseTime = endTime - startTime;
    var resu = title + "\r\nUrl path:" + path + "\r\nRequest:" + reques  + "\r\nResponse:" + respon + "\r\nResponse time:" + reponseTime + "ms" + "\r\n\r\n"
    fs.appendFile('public/apiLogging.txt', resu, function (err) {
        if (err) return console.log(err);
    });
}
module.exports = createLog;