"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
exports.resetPassword = function(req, res){

     // console.log("Request Query for reset password ");
     // console.log(req.query);

     // console.log("Request  Body for reset password");
     // console.log(req.body);



     

    var filters = req.query;
    var currentUser = req.currentUser;
    var oldPassword = req.body.old_password;
    var newPassword = req.body.password;
    db.employee.findOne({

        where: { employee_id : currentUser.EmployeeId }
    }).then(function(employee)
    {
        var empPassword = employee.password;
        if(empPassword == oldPassword){

            db.employee.update({
             password : newPassword
            },{
               where : { employee_id : currentUser.EmployeeId }
            }).then(function(empUpdate)
            {

                 res.json({
                success: true,
                ErrorCode : 100,
                message: 'Password updated sucessfully.',
                ServerCurrentTime: new Date().getTime(),
                });

             }).catch(function(err)
             {
                      response(res).failure(err);
             });
        }else{

               res.json({
                success: false,
                ErrorCode : 118,
                message: 'Invalid Old Password !',
                ServerCurrentTime: new Date().getTime(),
                });
     
        }

    }).catch(function(err)
    {
         response(res).failure(err);
    });

    // db.employee.update(req.body,
    // {
    // 	where: { employee_id : currentUser.EmployeeId }

    // }).then(function(emp)
    // {

    // 	res.json({
    //             success: true,
    //             ErrorCode : 100,
    //             message: 'Password updated sucessfully.',
    //             ServerCurrentTime: new Date().getTime(),
    //             });
    	
    // }).catch(function(err)
    // {
    //        response(res).failure(err);
    // });

};

