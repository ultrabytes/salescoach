"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var log = require("../../api_logs/create_logs");
var reportingPerson = require('../../helpers/reporting_heirarchy');
var dWM = require('../../helpers/delete_with_mapping');
exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {
        if (err) {
            response(res).failure(err);
        }

        if(status == false)
        {
           response(res).failure("Not Authorized !");
        }

        else {
            db.contact.findAndCountAll({
                where: q || {},
                include: [
                    { all: true }
                ],
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]

            }).then(function (contacts) {

                //res.send(contacts);

                if(contacts.rows.length == 0){

                       var resJson = {
                              success: true,
                              ErrorCode : 100,
                              message: 'completed sucessfully',
                              items: [],
                              recordCount: 0,
                              ServerCurrentTime: new Date().getTime(),
                              moreRecordsAvailable: false
                      };

                      return res.send(resJson);
                }


                var reportingPersonObject = {};
                var obOrganization= null;
                var reportingPersonId = contacts.rows[0].employee.reporting_person || null;
                db.employee.find(
                {
                    where : { employee_id : reportingPersonId }

                }).then(function(reportingPerson)
                {
                    reportingPersonObject = reportingPerson;
                     var items = contacts.rows.map(function (c) {
                         if(c.organization)
                         {
                             obOrganization = c.organization.toModel();
                         }else
                         {
                            obOrganization = null;
                         }

                         // console.log("employeee id is------>"+c.employee_id);
                         if(c.employee_id == filters.emp_id)
                         {
                            var IsReassigned = 0;
                         }else
                         {
                            var IsReassigned = 1;
                         }
                         // console.log("is Reassgined--->"+IsReassigned);
                         var temp = c.toModelUpdate();
                             temp.Organization = obOrganization;
                        return temp;

                     });
                    //response(res).page(items);

                    var moreRecordsAvailable = false;

                    if(contacts.count > contacts.rows.length)
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

                      log.run(req,resJson,"contact_log.txt");

                    res.json(resJson);


                   });
               
            }).catch(function (err) {
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;
    var currentUser = req.currentUser;

    var id = req.params.id || Model.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.contact.findById(id)
            .then(function (contact) {
                toEntityUpdate(contact, Model, req.currentUser,action)
                    .save()
                    .then(function (entity) {
                        log.run(req,entity.toModelUpdate(),"contact.txt");
                        response(res).data(entity.toModelUpdate());
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
        var buildCondition = true;
        var build = true;

        db.account_setting.find(
        {
            where : { account_id: req.currentUser.AccountId },
            attributes : ['allow_duplicate_contacts']

        }).then(function(account)
        {
            if(account && account.allow_duplicate_contacts == 1)
            {
               buildCondition = false;
            }

            if(buildCondition == true)
            {


                db.contact.count(
                {
                    where: { name: req.body.Name, number : req.body.Number , account_id : req.currentUser.AccountId }

                }).then(function(contactCount)
                {
                    //res.json({ contactCount : contactCount });
                    if(contactCount && contactCount > 0)
                    {
                        
                        res.json({
                        success: false,
                        ErrorCode: 115,
                        message: 'Duplicate Contact Entries not allowed',
                        ServerCurrentTime: new Date().getTime(),
                        
                        });


                    }else
                    {

                       createContact(req,res,Model,action);
                    }

                });
            
            }else
            {
                createContact(req,res,Model,action);

            }


        });

    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    var currentUser = req.currentUser;
    var obOrganization = null;
    db.contact.find({
        where: {
            contact_id: id
        },
        include: [
            { all: true }
        ]
    }).then(function (entity) {
        if(entity.organization)
        {
            obOrganization = returnOrganization(entity.organization,req);
        }else
        {
            obOrganization = null;
        }
        response(res).data(entity.toModel(obOrganization));
    }).catch(function (err) {
        response(res).failure(err);
    });
};

exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.contact.findById(id)
            .then(function (object) {
                object.active = false;
                object.last_updated = currentTime;
                object.save()
                    .then(function (entity) {
                         db.lead.update(
                         { 
                            active: false,
                            last_updated:currentTime

                           },
                         {
                            where: {contact_id : id }
                         }
                         ).then(function(lu)
                         {
                            db.meeting.update({
                                 active: false,
                                 last_updated:currentTime

                            },{
                                where: { contact_id : id }

                            }).then(function(mu)
                            {
                                db.note.update({
                                    active: false,
                                    last_updated:currentTime
                                },{
                                    where: { contact_id : id }
                                }).then(function(nu)
                                {
                                      db.task.update({
                                         active: false,
                                         last_updated:currentTime
                                      },{
                                         where: { contact_id : id }
                                      }).then(function(tu)
                                      {

                                          db.lead.findAll({
                                              where: {contact_id: id}
                                          }).then(function(lds){

                                              var ldsArray = [];
                                              lds.map(function(l){

                                                  ldsArray.push(l.lead_id);

                                              });

                                              dWM.deleteLead(req,res,ldsArray,currentTime,'lead_id',function(){
                                                  response(res).success();
                                              });




                                          }).catch(function(err){
                                              response(res).failure(err);

                                          });

                                      });
                                });
                            });
                             //response(res).success();
                         });
                        
                    })
                    .catch(function (err) {
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                response(res).failure(err);
            });
};



function createContact(req,res,Model,action)
{
    var reqInfo = { org_id : null , currentTime: new Date().getTime() };
    var obOrganization = null;
    if(req.body.Organization)
    {
        createOrganization(req,res,reqInfo);
    }
    setTimeout(function()
    {

            db.contact.build(toEntity({}, Model, req.currentUser,action,reqInfo))
            .save()
            .then(function (con) {
                db.contact.find(
                {
                    where : { contact_id : con.contact_id },
                    include: [
                        { all : true }
                    ]

                }).then(function(entity)
                {
                    //res.send(entity);
                    if(entity.organization)
                    {
                         obOrganization = returnOrganization(entity.organization,req);
                    }
                   
                    if(req.body.OrganizationId)
                    {
                        db.organization.find(
                        {
                            where : { organization_id : req.body.OrganizationId }

                        }).then(function(org)
                        {
                            if(org)
                            {
                               // res.send(org);
                               obOrganization =  returnOrganization(org,req);
                            }

                        });
                    }
                    setTimeout(function(){

                        log.run(req,entity.toModel(obOrganization),"contact_log.txt");
                        response(res).data(entity.toModel(obOrganization));
                    },500);
                    
                });
                 
            })
            .catch(function (err) {
                response(res).failure(err);
            });

    },2000);
    
      
}

var toEntity = function (entity, data, currentUser,action,reqInfo) {

    // // console.log("Data is ---------->");
    // // console.log(data);

    entity.last_updated = new Date().getTime();
  
       if(action == "create")
       {
           entity.initial_create = new Date().getTime();
           entity.last_updated = new Date().getTime();
        }
   
    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.number = data.Number;
    entity.email = data.Email;
    entity.address = data.Address;
    entity.seen = data.Seen || 1;
    entity.isLink = data.IsLink;
    entity.organization_id = reqInfo.org_id || null;
    entity.employee_id = data.EmployeeId || currentUser.EmployeeId;
    entity.age_group = data.AgeGroup;
    entity.income = data.Income;
    entity.dependent = data.Dependent;
    entity.add_picklist_1 = data.AddPicklist1;
    entity.add_picklist_2 = data.AddPicklist2;
    entity.add_picklist_3 = data.AddPicklist3;
    entity.add_num_field_1 = data.AddNum1;
    entity.add_num_field_2 = data.AddNum2;
    entity.add_text_field_1 =data.AddText1;
    entity.add_text_field_2 = data. AddText2;
    entity.add_date_field_1 =data. AddDate1;
    entity.add_date_field_2 =data.AddDate2;


    // // console.log("Entity is ---->");
    // // console.log(entity);
    return entity;
};


var toEntityUpdate = function (entity, data, currentUser,action) {
   
    entity.last_updated = new Date().getTime();
    entity.name = data.Name;
    entity.number = data.Number;
    entity.email = data.Email;
    entity.address = data.Address;
    entity.isLink = data.IsLink;
    entity.seen = data.Seen || 1;
    entity.organization_id = data.OrganizationId;
    //entity.employee_id = data.EmployeeId || currentUser.EmployeeId;
    entity.account_id = currentUser.AccountId;
    entity.age_group = data.AgeGroup;
    entity.income = data.Income;
    entity.dependent = data.Dependent;
    entity.add_picklist_1 = data.AddPicklist1;
    entity.add_picklist_2 = data.AddPicklist2;
    entity.add_picklist_3 = data.AddPicklist3;
    entity.add_num_field_1 = data.AddNum1;
    entity.add_num_field_2 = data.AddNum2;
    entity.add_text_field_1 =data.AddText1;
    entity.add_text_field_2 = data. AddText2;
    entity.add_date_field_1 =data. AddDate1;
    entity.add_date_field_2 =data.AddDate2;
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
                 q = {active: true, $or:[{employee_id: filters.emp_id,last_updated : { $gt : filters.timestamp }}, {contact_id : { in : [sequelize.literal('select contact_id from contact_log where old_employee_id ='+filters.emp_id)]  } ,last_updated : { $gt : filters.timestamp } }]};
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
                 q = {active: true,  employee_id : currentUser.EmployeeId };
                 if(filters.timestamp)
                 {
                    q = { active: true, employee_id : currentUser.EmployeeId , last_updated : { $gt : filters.timestamp } };
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


function createOrganization(req,res,reqInfo)
{
     var objectOrganization = req.body.Organization;
     objectOrganization.name = objectOrganization.Name;
     objectOrganization.account_id = req.currentUser.AccountId;
     objectOrganization.short_name = objectOrganization.ShortName;
     objectOrganization.type = objectOrganization.Type;
     objectOrganization.phone_number = objectOrganization.PhoneNumber;
     objectOrganization.address = objectOrganization.Address;
     objectOrganization.employee_id = req.currentUser.EmployeeId;
     objectOrganization.initial_create = new Date().getTime();
     objectOrganization.last_updated =  new Date().getTime();
    objectOrganization.ownership = objectOrganization.Ownership;
    objectOrganization.industry = objectOrganization.Industry;
    objectOrganization.revenue = objectOrganization.Revenue;
    objectOrganization.account_type = objectOrganization.AccountType;
    objectOrganization.employee_num = objectOrganization.EmployeeNumber;
    objectOrganization.add_picklist_1 = objectOrganization.AddPicklist1;
    objectOrganization.add_picklist_2 = objectOrganization.AddPicklist2;
    objectOrganization.add_picklist_3 = objectOrganization.AddPicklist3;
    objectOrganization.add_num_field_1 = objectOrganization.AddNum1;
    objectOrganization.add_num_field_2 = objectOrganization.AddNum2;
    objectOrganization.add_text_field_1 = objectOrganization.AddText1;
    objectOrganization.add_text_field_2 = objectOrganization.AddText2;
    objectOrganization.add_date_field_1 = objectOrganization.AddDate1;
    objectOrganization.add_date_field_2 = objectOrganization.AddDate2;
     db.organization.create(objectOrganization).then(function(org)
     {
        reqInfo.org_id = org.organization_id;

     });


}


function returnOrganization(obOrganization,req)
{
    var jsonOrganization = {

        OrganizationId: obOrganization.organization_id,
        Name: obOrganization.name || null,
        ShortName: obOrganization.short_name || null,
        Type: obOrganization.type || null,
        PhoneNumber: obOrganization.phone_number || null,
        Address: obOrganization.address || null,
        EmployeeId : obOrganization.employee_id || null,
        Ownership : obOrganization.ownership || null,
        Industry : obOrganization.industry || null,
        Revenue : obOrganization.revenue || null,
        AccountType : obOrganization.account_type || null,
        EmployeeNum : obOrganization.employee_num || null,
        AddPicklist1 : obOrganization.add_picklist_1 || null,
        AddPicklist2 : obOrganization.add_picklist_2 || null,
        AddPicklist3 : obOrganization.add_picklist_3 || null,
        AddNum1 : obOrganization.add_num_field_1 || null,
        AddNum2 : obOrganization.add_num_field_2 || null,
        AddText1 : obOrganization.add_text_field_1 || null,
        AddText2 : obOrganization.add_text_field_2 || null,
        AddDate1 : obOrganization.add_date_field_1 || null,
        AddDate2 : obOrganization.add_date_field_2 || null,
        InitialCreate: obOrganization.initial_create,
        LastUpdated: obOrganization.last_updated
    }

    return jsonOrganization;
}
