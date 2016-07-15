var jwt = require('jsonwebtoken');
var config={}
config.token_timeout = '1';
config.AssetTempUploadDir ='public/upload/';
config.UploadFileSize = '10485760'; //byte
config.generateJWT = function() {
	console.log(config)
	// set expiration to 60 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 1);

	return jwt.sign({
		username: this.username,
		exp: parseInt(exp.getTime() / 1000),
	}, 'SECRET');
  
}
module.exports=config