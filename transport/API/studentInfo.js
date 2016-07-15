var router = require('express').Router();
var request = require('request');
//var router = express.Router();


router.post('/', function (req, res, next) {
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
          if(req.body.student_id.length>0){ res.json({"school_id":req.body.school_id,"route_id":req.body.route_id,"stoppage_id":req.body.stoppage_id,"stoppage_name":req.body.stoppage_name,"students":[{"student_id":req.body.student_id[0],"class_idsection":req.body.class_id+" "+req.body.section_name,"contact_number":"978123456"},{"student_id":req.body.student_id[1],"class_idsection":req.body.class_id+" "+req.body.section_name,"contact_number":"978129087"}]})
        }
        else{
            res.json({"school_id":req.body.school_id,"route_id":req.body.route_id,"stoppage_id":req.body.stoppage_id,"stoppage_name":req.body.stoppage_name,"students":[]})
        }
    }
});
 
router.get("/",function(req, res, next){
    if (process.env.node_env != "dev") {
       
    }else{
       res.json({data:process.dummyData.getStoppageStudents});
    }
})

module.exports = router;