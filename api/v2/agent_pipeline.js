"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var reportingPerson = require('../../helpers/reporting_heirarchy');
exports.all = function(req, res){

    var rpObject = [];

    getReportingPersons(req,res,function(employees){

        if(employees.length > 0)
        {
            async.forEachSeries(employees,function(emp, callback){

                getEmployeeData(req,res,emp,function(recordObject){

                    rpObject.push(recordObject);
                    callback();

                });


            },function(err){

                if (err) return next(err);
                // console.log("all is done..");
                response(res).data(rpObject);

            });

        }else
        {

            getEmployeeSelfData(req,res,function(recordObject){

                response(res).data(null);

            });

        }


    });

};



var getReportingPersons = function(req,res,call1){

    var filters = req.query;
    db.employee.findAll({

        where: { reporting_person: filters.EmployeeId}

    }).then(function(rp){

        if(rp){
            call1(rp);
        }else{
            call1(null);
        }

    }).catch(function(err){

        // console.log("error here...");
        response(res).failure(err);
    });




};



var getEmployeeData = function(req,res,emp,call2){



    var tempObject = null;
    db.agent.count({
        where: { employee_id : emp.employee_id, $or: [{status: 1}, {status: 4}]  },
    }).then(function(c){

        getEmployeeReportingPersonCount(req,res,emp,function(count){

            getEmployeeWithAccessLevel(req,res,emp,function(empO){


                var tempEmployee = empO.toModel();

                if(empO.access_level){

                    tempEmployee.AccessLevel = empO.access_level.toModel();
                }else{
                    tempEmployee.AccessLevel = null;
                }



                getReportingPersonAgentPipeline(req,res,emp,function(tag){



                    tempObject = {

                        "Employee" : tempEmployee,
                        "AgentInPipeline":c,
                        "TeamAgentInPipeline": parseInt(tag) + parseInt(c),
                        "EmployeeCount": count
                    };


                    call2(tempObject);

                });


            });



        });


    }).catch(function(err){

        response(res).failure(err);
    });


};


var getEmployeeSelfData = function(req,res,call2){



    var filters = req.query;
    var tempObject = null;

    db.employee.findOne({

        where: { employee_id: filters.EmployeeId},

    }).then(function(emp){

        db.agent.count({
            where: { employee_id : emp.employee_id,$or: [{status: 1}, {status: 4}]},
        }).then(function(c){



            getEmployeeWithAccessLevel(req,res,emp,function(empO){

                var tempEmployee = empO.toModel();

                if(empO.access_level){


                    tempEmployee.AccessLevel = empO.access_level.toModel();
                }else{
                    tempEmployee.AccessLevel = null;
                }




                tempObject = {

                    "Employee" : tempEmployee,
                    "AgentInPipeline": c,
                    "TeamAgentInPipeline": c,
                    "EmployeeCount": 0
                };


                call2(tempObject);




            });

        }).catch(function(err){
            response(res).failure(err);
        });


    }).catch(function(err){
        response(res).failure(err);
    });



};


var getEmployeeWithAccessLevel = function(req,res,emp,call4){

    db.employee.findOne({
        where: { employee_id : emp.employee_id },
        include: [{model: db.access_level }]
    }).then(function(empObject){
        if(empObject){
            call4(empObject);
        }else{

            call4(null);
        }

    });


};


var getReportingPersonAgentPipeline = function(req,res,emp,call5){



    reportingPerson.all(req,res,emp.employee_id,function(re){



        var totalPipelineValue = 0;

        async.forEachSeries(re,function(e,callback){

                db.agent.count({

                    where: { employee_id : e.employee_id,$or: [{status: 1}, {status: 4}]  },
                }).then(function(c){

                        totalPipelineValue+= c;


                    callback();


                }).catch(function(err){
                    response(res).failure(err);
                });

            },
            function(err){

                call5(totalPipelineValue);
            }
        );



    });


};


var getEmployeeReportingPersonCount = function(req,res,emp,call3){

    db.employee.count({

        where: { reporting_person: emp.employee_id}
    }).then(function(c){
        call3(c);

    }).catch(function(err){

        // console.log("Error occur-->");
        call3(0);
    });

};



