var router = require('express').Router();
var request = require('request');
//require('')
//var router = express.Router();
var multer = require('multer');

/*var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });*/
	var upload = multer({
					dest:'public/assets/tmp/upload/',
					//dest: currentDirPath,
					limits: {
						fileSize:'1048576' //in byte
					},
					onFileUploadStart: function(file) {			
						console.log(file.name + ' uploading is ended ...');					
					},
					rename: function (fieldname, filename) {
						return filename.replace(/\W+/g, '-').toLowerCase();
					},		
					onFileUploadComplete: function (file, req, res) {
						console.log(file.name + ' uploading is ended ...');
						console.log("File name : "+ file.name +"\n"+ "FilePath: "+ file.path)
					},
					onError: function (error, next) {
						console.log("File uploading error: => "+error)
						next(error);
						//return res.json('File upload failed.');
						//apiResponse.getData(res, 1008, 'File upload failed!', '');
					},
					onFileSizeLimit: function (file) {
						console.log('Failed: ', file.originalname +" in path: "+file.path)
						fs.unlink(file.path); // delete the partially written file
						//return res.json('File upload failed.');
						//apiResponse.getData(res, 1008, 'File upload failed!', '');
					}			
					
				}).single('file');
  /*var upload = multer({ //multer settings
                    storage: storage
                }).single('file');*/

 
router.post('/', function (req, res, next) {
   console.log("nbcnxcbxnc "+JSON.stringify(req.body.licence));
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
           upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({"driver_id": Math.floor(Math.random()*100),"driver_name":req.body.driver_name,"mobile_no":req.body.mobile_no,"licence":req.body.licence,"route_id":"","route_no":"","vehicle_id":"","vehicle_no":""})
        })
       
       //console.log(process.dummyData);
        //res.json({data:process.dummyData.getRoutes});
        
    }
});
 
router.get("/",function(req, res, next){
    if (process.env.node_env != "dev") {
       
    }else{
       res.json({data:process.dummyData.getDrivers});
    }
})
 
module.exports = router;