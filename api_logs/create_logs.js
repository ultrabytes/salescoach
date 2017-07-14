var fs = require("fs");
var moment = require('moment');

exports.run = function(req,res,file,currentTime){

    var currTime = new Date();


	var reqJson = {

				OriginalUrl : req.originalUrl,
				Method: req.route.methods,
				Params: req.params,
				Query: req.query,
				Body: req.body
			};



	// console.log("request is -->"+JSON.stringify(req));
	// console.log("response is -->"+JSON.stringify(res));
    try{
    	//console.log(req);
		var dataToWrite = "Request Object (Time:  "+ currTime +"):  \n ";
		dataToWrite+=JSON.stringify(reqJson);
		dataToWrite+="\n\n Response Object (Time: "+ currTime +") \n";
		dataToWrite+=JSON.stringify(res);
		dataToWrite+="\n\n\n\n";
	}catch(e){
		//console.log("Error logs are-->"+e);
	}

    //console.log("Process cwd------>"+process.cwd());
	fs.appendFile("api_logs/"+file, dataToWrite, function (err) {
       // console.log(err)
    });

};


exports.request = function(req,file){


   var currTime = new Date();
   var dataToWrite = "";


	var reqJson = {

				OriginalUrl : req.originalUrl,
				Method: req.route.methods,
				Params: req.params,
				Query: req.query,
				Body: req.body
			};


	try{
    	
		dataToWrite = "Request Object (Time:  "+ currTime +"):  \n ";
		dataToWrite+=JSON.stringify(reqJson);
		dataToWrite+="\n\n\n\n";
	}catch(e){
		//console.log("Error logs are-->"+e);
	}

	fs.appendFile("api_logs/"+file, dataToWrite, function (err) {
        //console.log(err)
    });

};