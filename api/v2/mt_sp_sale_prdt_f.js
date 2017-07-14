"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var log = require("../../api_logs/create_logs");
var logFile = "dsr_summary_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function(req, res){

	var filters = req.query;
	var currentUser = req.currentUser;
	// console.log("Current user employee id is --------->"+currentUser.EmployeeId);

    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {

        if (err) {
            //log.run(req,response(res).customError(err),logFile);
            response(res).failure(err);
        }
        if(status == false)
        {
            //log.run(req,response(res).customError("Not Authorized !"),logFile);
            return  response(res).failure("Not Authorized !");
        }

        db_dwdb.SP_SLS_PRDCT_AGGR_FACT.findAll({
            where: q || null
        }).then(function(sr){

            var items = sr.map(function (c) {
                return c.toModel();
            });

            response(res).page(items);



        }).catch(function(err){
            res.send(err);
        });




	});




};



var whereClause = function (req,res,filters, currentUser, callback) {
    var clause = [{  }];
    var empArray = [];
    var emp = null;
    var q = null;
    var limit = 5;
    var offset = 0;
    var aboveManager = 0;
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }

    db.access_level.findOne({
        where : { employee_id : currentUser.EmployeeId }


    }).then(function(al)
    {

        //// console.log("Access Level is ------------------------------------------>");
        // // console.log(al);

        if(al){
            if(al.description == "Above Manager"){
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }

        if(al && al.access_level == 2)
        {
            // condition 1


            //// console.log("Emp Array is--->"+empArray);

            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    empArray.push(e.employee_id);
                });


                if(filters.report_date && filters.emp_id)
                {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    //// console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if(empArray.indexOf(empId) != -1)
                    {

                        q = { employee_id : filters.emp_id ,Report_Dt :{ $eq: filters.report_date} };
                        callback(null, clause,q,limit,offset,al,true);


                    }else
                    {
                        callback(null, clause,q,limit,offset,al,false);

                    }

                }else
                {

                    q = { employee_id : currentUser.EmployeeId ,Report_Dt :{ $eq: filters.report_date} };


                    callback(null, clause,q,limit,offset,al,true);
                }



            });


        }else if(al && al.access_level == 1)
        {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if(filters.report_date && filters.emp_id)
            {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if(currentUser.EmployeeId == filters.emp_id)
                {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = { employee_id : filters.emp_id , Report_Dt :{ $eq: filters.report_date}  };
                    callback(null, clause,q,limit,offset,al,true);

                }else
                {
                    // condition 3.2

                    // console.log("condition 3.2 is called ----------->");
                    callback(null, clause,q,limit,offset,al,false);
                }


            }else
            {
                // condition 4
                // console.log("condition 4 is called ----------->");
                q = { employee_id : currentUser.EmployeeId };
                if(filters.timestamp)
                {
                    q = { employee_id : currentUser.EmployeeId ,Report_Dt :{ $eq: filters.report_date}  };
                }

                callback(null, clause,q,limit,offset,al,true);

            }

            //  q = { employee_id : currentUser.EmployeeId , active:true };

            // if(filters.timestamp)
            // {
            //   q = { employee_id : currentUser.EmployeeId , active:true , last_updated : { $gt : filters.timestamp } };

            // }



        }else
        {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause,q,limit,offset,al,false);
        }





    });
};