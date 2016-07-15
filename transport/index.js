var express = require('express');
var path = require('path');
var request = require('request');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

//routing for public content;
app.use('/', express.static(__dirname + '/app'));

//routing for public content;
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use("/restapi", function (req, res) {
    
    
    request({
        url: 'http://apptesting.fliplearn.com/index.php/restapi/v2/ApiUser/drivers', //URL to hit
        qs: {
            from: 'blog example',
            time: +new Date()
        }, //Query string data
        method: 'POST',
        headers: {
            'Content-Type': 'MyContentType',
            'Custom-Header': 'Custom Value'
        },
        body: '{ "session_token":"IHiiafBv4GssNNpYzeo8ckg6R","uuid":"162527" } ' //Set the body as a string
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            //console.log(response.statusCode, body);
            res.json(JSON.parse(body))
            
        }
    });
})

//need to configure dev environment;
if (process.evn == 'dev') {

}

//need to configure dev production;
if (process.evn == 'prod') {

}



//registering port;
app.listen(8000, function () {
    console.log('listening port 8181');
});