var db = require('../models');


exports.all = function(req,res,empId, cb){
var empArray = [empId];
var employeeObject = [];

var collectReportingPersons = function(emps){
		
		if(emps.length > 0){

			var empArrayInner = [];

			for (i in emps) {
				empArrayInner.push(emps[i].employee_id);
				employeeObject.push(emps[i]);
				
			}

			getHeirarchy(req,res,empArrayInner,collectReportingPersons);

		}else{

		     cb(employeeObject);
		}

		  

	};

	getHeirarchy(req,res,empArray,collectReportingPersons);

	
};

var getHeirarchy = function(req,res,empArray,callback){

	db.employee.findAll({
		  where: {reporting_person: {in: empArray} }
	}).then(function(c){

		callback(c);
	});
}
