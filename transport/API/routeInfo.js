var router = require('express').Router();
var request = require('request');
//require('')
//var router = express.Router();
 
router.post('/', function (req, res, next) {
   //console.log(req.body);
    if (process.env.node_env != "dev") {
        request({
            url: ' ', //URL to hit
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
 
                res.json({})
 
            }
        });
    } else {
       //console.log(process.dummyData);
        //res.json({data:process.dummyData.getRoutes});
        res.json({"route_id": Math.floor(Math.random()*100),"route_no":req.body.route_no,"start_location":req.body.start_location,"end_location":req.body.end_location,"driver_id":"","driver_name":"","vehicle_id":"","vehicle_name":"","vehicle_no":"","stoppage":[]})
    }
});
 
router.get("/",function(req, res, next){
    if (process.env.node_env != "dev") {
       
    }else{
       res.json({data:process.dummyData.getRoutes});
    }
})
 

router.post('/stoppage', function (req, res, next) {
   //console.log(req.body);
    if (process.env.node_env != "dev") {
        request({
            url: ' ', //URL to hit
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
 
                res.json({})
 
            }
        });
    } else {
       //console.log(process.dummyData);
        //res.json({data:process.dummyData.getRoutes});
        res.json({"stoppage_id": Math.floor(Math.random()*100),"order_no":"","stoppage_name":req.body.stoppage_name,"lat":req.body.lat,"long":req.body.long,"route_id":req.body.route_id})
    }
});
 
router.get("/stoppage",function(req, res, next){
    if (process.env.node_env != "dev") {
       
    }else{
       res.json({data:process.dummyData.getRoutes});
    }
})
module.exports = router;