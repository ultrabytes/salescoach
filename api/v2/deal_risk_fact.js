"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var currentTime = new Date().getTime();
var log = require("../../api_logs/create_logs");
var logFile = "lead_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');
var dWM = require('../../helpers/delete_with_mapping');

exports.all = function (req, res) {

    

    var filters = req.query;
    var currentUser = req.currentUser;
    var currentTime = new Date().getTime();

    //return res.send(moment(parseInt(filters.timestamp)).format("YYYY-MM-DD hh:mm:ss"));

    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {


        if (err) {

            var error = {
                "success": false,
                "ErrorCode": 116,
                "message": "fail",
                "ServerCurrentTime": new Date().getTime(),
                "error": err
            };

            response(res).failure(err);
        }
        if(status == false)
        {

            response(res).failure("Not Authorized !");
        }else{

            db_dwdb.DEAL_RISK_FACT.findAndCountAll({
                where: q || {},
                limit: 100 , offset: offset,
                order: [["SOURCE_BACK_PULL_ID","ASC"]]
            }).then(function(drp){

                //return res.send(drp);

                var items = drp.rows.map(function (c) {

                    return c.toModel();

                });

                var moreRecordsAvailable = false;

                if(drp.count > drp.rows.length)
                {
                    moreRecordsAvailable = true;
                }

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    items: items,
                    recordCount: items.length,
                    ServerCurrentTime: currentTime,
                    moreRecordsAvailable: moreRecordsAvailable
                };

                res.json(resJson);

            }).catch(function(err){
                response(res).failure(err);
            });

        }

    });



};

var whereClause = function (req,res,filters, currentUser, callback) {
    var clause = [{  }];
    var empArray = [];
    var emp = null;
    var q = null;
    var limit = 5;
    var offset = 0;
   // var timestamp = moment(parseInt(filters.timestamp)).format("YYYY-MM-DD HH:mm:ss");
    var timestamp = parseInt(filters.timestamp);
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }
    var aboveManager = 0;


    //res.send(aboveManager);

    db.access_level.findOne({
        where : { employee_id : currentUser.EmployeeId }
    }).then(function(al)
    {
        // console.log("Access Level is ------------------------------------------>");
        // console.log(al);

        if(al){
            if(al.description == "Above Manager"){
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }



        if(al && al.access_level == 2)
        {
            // condition 1
            // console.log("condition 1 is called ---------------------------------------->");


            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    empArray.push(e.employee_id);
                });


                // console.log("Emp Array is--->"+empArray);


                if(filters.timestamp && filters.emp_id)
                {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    // console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if(empArray.indexOf(empId) != -1)
                    {
                        if(aboveManager == 1){
                            // console.log("Data for above manager ------------------------>");
                            q = {employee_id: filters.emp_id,SOURCE_BACK_PULL_ID : { $gt : timestamp }};

                        }else{

                            q = {employee_id: filters.emp_id,SOURCE_BACK_PULL_ID : { $gt : timestamp }};
                        }

                        callback(null, clause,q,limit,offset,al,true);


                    }else
                    {
                        callback(null, clause,q,limit,offset,al,false);

                    }

                }else
                {

                    q = { employee_id : currentUser.EmployeeId};
                    if(filters.timestamp)
                    {
                        q = { employee_id : currentUser.EmployeeId ,SOURCE_BACK_PULL_ID : { $gt : timestamp }};
                    }

                    callback(null, clause,q,limit,offset,al,true);
                }

            }); // end reporting person callback

        }else if((al && al.access_level == 1) || aboveManager == 1)
        {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if(filters.timestamp && filters.emp_id)
            {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if(currentUser.EmployeeId == filters.emp_id)
                {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = {employee_id: filters.emp_id,SOURCE_BACK_PULL_ID : { $gt : timestamp }};
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
                    q = { employee_id : currentUser.EmployeeId ,SOURCE_BACK_PULL_ID : { $gt : timestamp } };
                }

                callback(null, clause,q,limit,offset,al,true);

            }



        }else
        {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause,q,limit,offset,al,false);
        }





    });
};