"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var log = require("../../api_logs/create_logs");
var logFile = "organization_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(req,res,filters, currentUser, function(err, clause,q,limit,offset,al,status){
        if(err) {
            response(res).failure(err);
        }

        if(status == false)
        {
           response(res).failure("Not Authorized !");
        }

        else {
            db.organization.findAndCountAll({
                where : q || {},
                include: [
                    {all: true}
                ],
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]

            }).then(function (orgs) {
                var items = orgs.rows.map(function (c) {
                    return c.toModel();
                });

                var moreRecordsAvailable = false;

                    if(orgs.count > orgs.rows.length)
                    {
                         moreRecordsAvailable = true;
                    }

                     var resJson = {
                              success: true,
                              ErrorCode : 100,
                              message: 'completed sucessfully',
                              items: items,
                              recordCount: items.length,
                              ServerCurrentTime: new Date().getTime(),
                              moreRecordsAvailable: moreRecordsAvailable
                      };

                      log.run(req,resJson,logFile);

                  res.json(resJson);



                //response(res).page(items);
            }).catch(function(err){
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var organizationModel = req.body;

    var id = req.params.id || organizationModel.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.organization.findById(id)
            .then(function (organization) {
                toEntity(organization, organizationModel, req.currentUser,action)
                    .save()
                    .then(function (entity) {
                        log.run(req,entity.toModel(req.currentUser),logFile);
                        response(res).data(entity.toModel(req.currentUser));
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
        db.organization.build(toEntity({}, organizationModel, req.currentUser,action))
            .save()
            .then(function (entity) {
                 log.run(req,entity.toModel(req.currentUser),logFile);
                response(res).data(entity.toModel(req.currentUser));
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.organization.find({
        where: {
            organization_id: id
        },
        include: [
            {all: true}
        ]
    }).then(function (entity) {
        log.run(req,entity.toModel(req.currentUser),logFile);
        response(res).data(entity.toModel(req.currentUser));

    }).catch(function (err) {
        response(res).failure(err);
    });
};

exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.organization.findById(id)
            .then(function (object) {
                object.active = false;
                object.last_updated = currentTime;
                object.save()
                    .then(function (entity) {

                         var del = {
                                      "ErrorCode": 100,
                                      "success": true,
                                      "message": "completed sucessfully",
                                      "ServerCurrentTime": new Date().getTime()
                        };

                        log.run(req,del,logFile);
                        response(res).success();
                    })
                    .catch(function (err) {
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                response(res).failure(err);
            });
};

var toEntity = function (entity, data, currentUser,action) {
    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.short_name = data.ShortName;
    entity.type = data.Type;
    entity.phone_number = data.PhoneNumber;
    entity.address = data.Address;
    if(data.EmployeeId){
        entity.employee_id = data.EmployeeId;
    }
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    entity.ownership = data.Ownership;
    entity.industry = data.Industry;
    entity.revenue = data.Revenue;
    entity.account_type = data.AccountType;
    entity.employee_num = data.EmployeeNumber;
    entity.add_picklist_1 = data.AddPicklist1;
    entity.add_picklist_2 = data.AddPicklist2;
    entity.add_picklist_3 = data.AddPicklist3;
    entity.add_num_field_1 = data.AddNum1;
    entity.add_num_field_2 = data.AddNum2;
    entity.add_text_field_1 = data.AddText1;
    entity.add_text_field_2 = data.AddText2;
    entity.add_date_field_1 = data.AddDate1;
    entity.add_date_field_2 = data.AddDate1;

    //entity.active = data.Active;
    return entity;
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
          // console.log("condition 1 is called ----------->");
          

            

                    reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                                empObject.map(function(e){

                                      empArray.push(e.employee_id);
                               });

                                if(filters.timestamp && filters.emp_id)
                     {
                          empArray.push(currentUser.EmployeeId);
                          var empId = parseInt(filters.emp_id);
                
                          // console.log("INdex  Is--------->"+empArray.indexOf(empId));
                           if(empArray.indexOf(empId) != -1)
                           {

                             q = { active: true,employee_id : filters.emp_id , last_updated : { $gt : filters.timestamp } };
                             callback(null, clause,q,limit,offset,al,true);


                           }else
                           {
                              callback(null, clause,q,limit,offset,al,false);

                           }
         
                        }else
                        {

                             q = { active: true,employee_id : currentUser.EmployeeId };
                             if(filters.timestamp)
                             {
                                q = { active: true, employee_id : currentUser.EmployeeId , last_updated : { $gt : filters.timestamp } };
                             }

                             callback(null, clause,q,limit,offset,al,true);
                        }


                    });

                     





            //     });

               


            // });
         }else if(al && al.access_level == 1)
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
                  q = {active: true, employee_id : filters.emp_id  , last_updated : { $gt : filters.timestamp } };
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
                 q = { active: true,employee_id : currentUser.EmployeeId };
                 if(filters.timestamp)
                 {
                    q = { active: true,employee_id : currentUser.EmployeeId  , last_updated : { $gt : filters.timestamp } };
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




