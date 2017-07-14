"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var reportingPerson = require('../../helpers/reporting_heirarchy');


exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(req,res,filters, currentUser, function(err, clause,q,limit,offset,al){
        if (err) {
            response(res).failure(err);
        }
        else {
              
            db.employee.findAndCountAll({
                where: q || null,
                include: [{model:db.role}],
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]
            }).then(function (employees) {

               //return res.send(employees);
                
                var items = employees.rows.map(function (c) {
                    var em = c.toModel();
                    if(c.role){
                        em.Role = c.role.toModel();
                    }else{
                        em.Role = null;
                    }
                    return em;
                });
                var moreRecordsAvailable = false;

                if(employees.count > employees.rows.length)
                {
                     moreRecordsAvailable = true;
                }

              
               //response(res).page(items);
               res.json({
                success: true,
                ErrorCode : 100,
                message: 'completed sucessfully',
                items: items,
                recordCount: items.length,
                ServerCurrentTime: new Date().getTime(),
                moreRecordsAvailable: moreRecordsAvailable
            });


            }).catch(function (err) {
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.employee.findById(id)
            .then(function (employee) {
                toEntity(employee, Model, req.currentUser,action)
                    .save()
                    .then(function (entity) {
                        response(res).data(entity.toModel());
                    })
                    .catch(function (err) {
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    } else {
        action = "create";
        db.employee.build(toEntity({}, Model, req.currentUser,action))
            .save()
            .then(function (entity) {
                response(res).data(entity.toModel());
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.employee.find({
        where: {
            employee_id: id
        },
        include: [
            {all: true}
        ]
    }).then(function (entity) {
        response(res).data(entity.toModel());
    }).catch(function (err) {
        response(res).failure(err);
    });
};

var toEntity = function (entity, data, currentUser,action) {
    entity.first_name = data.FirstName;
    entity.last_name = data.LastName;
    entity.middle_name = data.MiddleName;
    entity.employee_code = data.EmployeeCode;
    entity.email = data.Email;
    entity.password = data.Password;
    entity.account_id = data.AccountId;
    entity.phone_number = data.PhoneNumber;
    entity.role_id = data.RoleId;
    entity.business_unit = data.BusinessUnit;
    entity.reporting_person = data.ReportingPerson;
    entity.status = data.Status;
    entity.token = data.Token;
    entity.gender = data.Gender;
    entity.default_picklist = data.DefaultPicklist;
    entity.last_updated = new Date().getTime(); 
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create; 
    }
    
    
    return entity;
};

var whereClause = function (req,res,filters, currentUser, callback) {
     var clause = [{  }];
     var empArray = [currentUser.EmployeeId];
     var emp = null;
     var q = null;
     var limit = 5;
     var offset = 0;
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }

    db.access_level.findOne({
        where : { employee_id : currentUser.EmployeeId },
        attributes : ['access_level'],
        group : ['access_level']

    }).then(function(al)
    {

         if(al && al.access_level == 2)
         {


                 reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                        empObject.map(function(e){

                            empArray.push(e.employee_id);
                        });

                        q = { employee_id : {in : empArray} };

                    if(filters.timestamp)
                    {
                         
                         q = { employee_id : {in : empArray}, last_updated : { $gt : filters.timestamp } };

                    }
                   callback(null, clause,q,limit,offset,al);

                 });


         }else
         {
            if(al && al.access_level == 1){
                    if(filters.timestamp)
                    {
                                 
                       q = { employee_id : currentUser.EmployeeId, last_updated : { $gt : filters.timestamp } };

                    }else{
                        q = { employee_id : currentUser.EmployeeId };
                    }


                     callback(null, clause,q,limit,offset,al);
             }else{

                    return response(res).failure("Not Authorized !");
             }        
         }
        
         
        
        
        

    });

   


   
};


exports.rp = function(req,res){

    var filters = req.query;
    var currentUser = req.currentUser;

    reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                        res.send(empObject);

   });
    



}