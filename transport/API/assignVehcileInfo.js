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
        res.json({"driver_name":req.body.driver_name,"driver_id":req.body.driver_id,"route_no":req.body.route_no,"route_id":req.body.route_id,"vehicle_no":req.body.vehicle_no,"vehicle_id":req.body.vehicle_id})
    }
});

router.get("/",function(req, res, next){
    if (process.env.node_env != "dev") {
        
    }else{
       res.json({data:process.dummyData.getAssignedVehicles}); 
    }
})

module.exports = router;