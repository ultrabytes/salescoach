"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var log = require("../../api_logs/create_logs");
var logFile = "lead_assign_log.txt";

exports.leadAssign = function(req,res){

    var currentTime = new Date().getTime();
    var filters = req.query;
    var currentUser = req.currentUser;
    var leadIds = req.body.LeadIds || null;
    var EmployeeId = req.body.EmployeeId || null;

     return db.sequelize.transaction().then(function(t){


        return  db.lead.findAll({
           where : { lead_id : { in: leadIds  } },
           include: [ { model : db.contact } ]

        }).then(function(leads){

             if(leads.length > 0)
             {

                async.forEachSeries(leads,function(c,callback){

                    if(c.contact)
                    {
                      var contactObject = c.contact;
                    }else
                    {
                       var contactObject = null;
                    }

                    createContactWithLeadUpdate(req,res,contactObject,currentTime,c,t,function(status){

                           callback();

                    });

                    

                },
                function(err){

                  if (err) {
                    t.rollback();
                    return next(err);
                  }
                    t.commit();
                   
                    setTimeout(function(){

                          return db.lead_log.findAll(
                          {
                            where : { initial_create : currentTime },
                            include:[{model: db.lead ,include:[ { model: db.contact }]}]

                         }).then(function(lls)
                          {
                             // res.send(lls);

                                var items = lls.map(function (c) {

                                 if(c.lead && c.lead.contact){

                                       var objectC = returnContact(c.lead.contact);

                                 }else{
                                     var objectC = null
                                 }
                                  
                                      
                                        return c.toModel(objectC);
                                });
                             

                             log.run(req,items,logFile);
                             response(res).page(items);

                          }).catch(function(err){
                                  
                                   response(res).failure(err);
                               });




                    },500);
                    

                });
                


                 


             }else{

                     var resJson = {
                        success: false,
                        ErrorCode: 116,
                        message: 'Unable to find Leads of these ids',
                        ServerCurrentTime: new Date().getTime(),
                        
                        };

                log.run(req,resJson,logFile);        

                res.json(resJson);

             }

        });
     });

    


};



function createContactWithLeadUpdate(req,res,objectContact,currentTime,leadObject,t,callb)
{
   var objectC = {};

   // console.log("------------->object COntact"+objectContact);
  
   
    if(objectContact)
    {

      objectC.name = objectContact.name;
      objectC.account_id = req.currentUser.AccountId;
      objectC.number = objectContact.number;
      objectC.email = objectContact.email;
      objectC.address = objectContact.address;
      objectC.seen = 0;
      objectC.isLink = objectContact.isLink;
      objectC.organization_id = objectContact.organization_id;
      objectC.employee_id = req.body.EmployeeId || null;
      objectC.initial_create =currentTime;
      objectC.last_updated = currentTime;

        objectC.age_group = objectContact.AgeGroup;
        objectC.income = objectContact.Income;
        objectC.dependent = objectContact.Dependent;
        objectC.add_picklist_1 = objectContact.AddPicklist1;
        objectC.add_picklist_2 = objectContact.AddPicklist2;
        objectC.add_picklist_3 = objectContact.AddPicklist3;
        objectC.add_num_field = objectContact.AddNum1;
        objectC.add_num_field_2 = objectContact.AddNum2;
        objectC.add_text_field_1 =objectContact.AddText1;
        objectC.add_text_field_2 = objectContact. AddText2;
        objectC.add_date_field_1 =objectContact. AddDate1;
        objectC.add_date_field_2 =objectContact.AddDate2;


      db.contact.create(objectC,{transaction:t}).then(function(cont)
      {

            db.organization.findOne({

               where: { organization_id : cont.organization_id  }
            }).then(function(orgObject)
            {
                 var tempOrg ={};

                 if(orgObject)
                 {

                       tempOrg.account_id = orgObject.account_id;
                       tempOrg.employee_id = req.body.EmployeeId || null;
                       tempOrg.name = orgObject.name;
                       tempOrg.short_name = orgObject.short_name;
                       tempOrg.phone_number = orgObject.phone_number;
                       tempOrg.type = orgObject.type;
                       tempOrg.initial_create = currentTime;
                       tempOrg.last_updated = currentTime;

                     tempOrg.ownership = orgObject.Ownership;
                     tempOrg.industry = orgObject.Industry;
                     tempOrg.revenue = orgObject.Revenue;
                     tempOrg.account_type = orgObject.AccountType;
                     tempOrg.employee_num = orgObject.EmployeeNum;
                     tempOrg.add_picklist_1 = orgObject.AddPicklist1;
                     tempOrg.add_picklist_2 = orgObject.AddPicklist2;
                     tempOrg.add_picklist_3 = orgObject.AddPicklist3;
                     tempOrg.add_num_field_1 = orgObject.AddNum1;
                     tempOrg.add_num_field_2 = orgObject.AddNum2;
                     tempOrg.add_text_field_1 = orgObject.AddText1;
                     tempOrg.add_text_field_2 = orgObject.AddText2;
                     tempOrg.add_date_field_1 = orgObject.AddDate1;
                     tempOrg.add_date_field_2 = orgObject.AddDate2;

                       db.organization.create(tempOrg,{transaction:t}).then(function(org)
                       {


                              /**** lead update start ***/

                             db.lead.update({

                                 employee_id : req.body.EmployeeId || null,
                                 isReassigned: 1,
                                 contact_id : cont.contact_id || null,
                                 seen: 0,
                                 organization_id:org.organization_id,
                                 last_updated: currentTime
                               },
                               {
                                    where : { lead_id : leadObject.lead_id  },
                                    transaction:t
                               }).then(function(lu)
                               {

                                  db.meeting.update({

                                    employee_id: req.body.EmployeeId || null,
                                    contact_id:cont.contact_id || null,
                                    last_updated: currentTime
                                  },{
                                      where: {lead_id: leadObject.lead_id },
                                      transaction:t
                                  }).then(function(mu){


                                     db.lead_stage_calculation.update({

                                      employee_id: req.body.EmployeeId || null,
                                      last_updated: currentTime

                                     },{
                                      where: {lead_id: leadObject.lead_id },
                                      transaction:t

                                     }).then(function(lsu){

                                          
                                          var tempLeadLog = {

                                              lead_id : leadObject.lead_id,
                                              old_employee_id : leadObject.employee_id,
                                              new_employee_id : req.body.EmployeeId || null,
                                              assigned_by_id : req.currentUser.EmployeeId,
                                              initial_create : currentTime,
                                              last_updated : currentTime
                                         };


                                         db.note.update({

                                          employee_id: req.body.EmployeeId || null,
                                          contact_id : cont.contact_id || null,
                                          last_updated: currentTime

                                           },{
                                            where: {lead_id: leadObject.lead_id },
                                            transaction:t


                                         }).then(function(nu){



                                                db.meeting.findAll({
                                                  where: {lead_id : leadObject.lead_id }
                                                }).then(function(meetings){

                                                    var meetingToUpdateIds = [];
                                                    var contactToUpdateIds = [];

                                                    meetings.map(function(m){
                                                        meetingToUpdateIds.push(m.meeting_id);
                                                        contactToUpdateIds.push(m.contact_id);
                                                    });


                                                    db.note.update({

                                                      employee_id: req.body.EmployeeId || null,
                                                      last_updated: currentTime,
                                                      contact_id : cont.contact_id || null,

                                                       },{
                                                        where: {meeting_id: {in:meetingToUpdateIds } },
                                                        transaction:t


                                                    }).then(function(nu2){

                                                         db.product_lead_mapping.update({

                                                            employee_id: req.body.EmployeeId || null,
                                                            last_updated: currentTime
                                                          },{
                                                              where: {lead_id: leadObject.lead_id },
                                                              transaction:t
                                                          }).then(function(plm){


                                                               db.task.update({

                                                                    employee_id: req.body.EmployeeId || null,
                                                                    last_updated: currentTime,
                                                                    contact_id : cont.contact_id || null
                                                                  },{
                                                                      where: {lead_id: leadObject.lead_id },
                                                                      transaction:t
                                                                  }).then(function(tu){

                                                                      db.lead_doc_mapping.update({

                                                                          employee_id: req.body.EmployeeId || null,
                                                                          last_updated: currentTime

                                                                      },{

                                                                          where: {lead_id: leadObject.lead_id },
                                                                          transaction:t

                                                                      }).then(function(){

                                                                          db.lead_status_calculation.update({

                                                                              employee_id: req.body.EmployeeId || null,
                                                                              last_updated: currentTime

                                                                          },{

                                                                              where: {lead_id: leadObject.lead_id },
                                                                              transaction:t

                                                                          }).then(function(){

                                                                              db.lead_log.create(tempLeadLog,{transaction:t}).then(function(llog)
                                                                              {
                                                                                  // console.log(llog.id);
                                                                                  callb(true);


                                                                              }).catch(function(err){

                                                                                  t.rollback();
                                                                                  response(res).failure(err);
                                                                              });

                                                                          }).catch(function(err){
                                                                              t.rollback();
                                                                              response(res).failure(err);
                                                                          });

                                                                      }).catch(function(err){
                                                                          t.rollback();
                                                                          response(res).failure(err);
                                                                      });



                                                                   }).catch(function(err){
                                                                       // console.log("Error in task update 1st");
                                                                        t.rollback();
                                                                        response(res).failure(err);
                                                                   });;


                                                               

                                                          }).catch(function(err){
                                                              // console.log("Error in product lead mapping 1");
                                                              t.rollback();
                                                              response(res).failure(err);
                                                          });

                                                    }).catch(function(err){
                                                        
                                                         t.rollback();
                                                         response(res).failure(err);

                                                    });


                                                }).catch(function(err){
                                                    t.rollback();
                                                    response(res).failure(err);
                                                });
                                               


                                         }).catch(function(err){
                                              t.rollback();
                                              // console.log("error in note update");
                                              response(res).failure(err);
                                         });

                                        

                                    }).catch(function(err){

                                             t.rollback();
                                             response(res).failure(err);

                                    });

                                    
                                   

                                  }).catch(function(err){

                                       t.rollback();
                                       // console.log("Error in meeting update");
                                       //res.send(err);
                                       response(res).failure(err);

                                  });
                                  
                                  
                               }).catch(function(err){
                                   t.rollback();
                                   response(res).failure(err);
                               });


                              /**** lead update end ******/





                       }).catch(function(err){
                            t.rollback();
                            response(res).failure(err);
                       });



                 }else
                 {



                    /**** lead update start *****/

                   // res.send("this is here");

                    // console.log("Lead Update start");


                        db.lead.update({

                         employee_id : req.body.EmployeeId || null,
                         isReassigned: 1,
                         seen: 0,
                         contact_id : cont.contact_id || null,
                         organization_id: null,
                         last_updated: currentTime
                      },
                     {
                          where : { lead_id : leadObject.lead_id  },
                          transaction:t
                     }).then(function(lu)
                     {

                         db.lead_stage_calculation.update({

                             employee_id : req.body.EmployeeId || null,
                             last_updated: currentTime,
                            

                         },{

                             where : { lead_id : leadObject.lead_id  },
                             transaction:t

                         }).then(function(){
                                    

                                    var tempLeadLog = {

                                    lead_id : leadObject.lead_id,
                                    old_employee_id : leadObject.employee_id,
                                    new_employee_id : req.body.EmployeeId || null,
                                    assigned_by_id : req.currentUser.EmployeeId,
                                    initial_create : currentTime,
                                    last_updated : currentTime
                                   };

                                   db.meeting.update({

                                    employee_id: req.body.EmployeeId || null,
                                    last_updated: currentTime,
                                    contact_id : cont.contact_id || null

                                  },{
                                      where: {lead_id: leadObject.lead_id },
                                      transaction:t
                                  }).then(function(mu){


                                       db.note.update({

                                            employee_id: req.body.EmployeeId || null,
                                            last_updated: currentTime,
                                            contact_id : cont.contact_id || null,
                                          },{
                                              where: {lead_id: leadObject.lead_id },
                                              transaction:t
                                       }).then(function(nu){


                                               db.meeting.findAll({
                                                  where: { lead_id : leadObject.lead_id }
                                               }).then(function(meetings){

                                                var meetingToUpdateIds = [];
                                                var contactToUpdateIds = [];

                                                    meetings.map(function(m){
                                                      meetingToUpdateIds.push(m.meeting_id);
                                                      contactToUpdateIds.push(m.contact_id);
                                                    });


                                                    db.note.update({

                                                      employee_id: req.body.EmployeeId || null,
                                                      last_updated: currentTime,
                                                      contact_id : cont.contact_id || null
                                                    },{
                                                        where: {meeting_id: {in: meetingToUpdateIds} },
                                                        transaction:t
                                                    }).then(function(nu2){


                                                          db.product_lead_mapping.update({

                                                            employee_id: req.body.EmployeeId || null,
                                                            last_updated: currentTime
                                                          },{
                                                              where: {lead_id: leadObject.lead_id },
                                                              transaction:t
                                                          }).then(function(plm){


                                                                db.task.update({

                                                                    employee_id: req.body.EmployeeId || null,
                                                                    last_updated: currentTime,
                                                                    contact_id : cont.contact_id || null,
                                                                  },{
                                                                      where: {lead_id: leadObject.lead_id },
                                                                      transaction:t
                                                                  }).then(function(tu){

                                                                      db.lead_doc_mapping.update({
                                                                          employee_id: req.body.EmployeeId || null,
                                                                          last_updated: currentTime

                                                                      },{
                                                                          where: {lead_id: leadObject.lead_id },
                                                                          transaction:t


                                                                      }).then(function(){

                                                                          db.lead_log.create(tempLeadLog,{transaction:t}).then(function(llog)
                                                                          {
                                                                              // console.log(llog.id);
                                                                              callb(true);


                                                                          }).catch(function(err){

                                                                              // console.log("Error in log create...");

                                                                              t.rollback();
                                                                              response(res).failure(err);
                                                                          });

                                                                      }).catch(function(err){

                                                                          t.rollback();
                                                                          response(res).failure(err);

                                                                      });



                                                                         



                                                                  }).catch(function(err){
                                                                       t.rollback();
                                                                       response(res).failure(err);
                                                                  });


                                                               

                                                          }).catch(function(err){
                                                              // console.log("Error in product lead mapping 1");
                                                              t.rollback();
                                                              response(res).failure(err);
                                                          });

                                                           


                                                    }).catch(function(err){
                                                         // console.log("Error in note update 2nd for meetings");
                                                    });

                                               }).catch(function(err){
                                                   t.rollback();
                                                   // console.log("Error in meeting find 2nd");
                                                   response(res).failure(err);
                                               });



                                       }).catch(function(err){
                                           t.rollback();
                                           // console.log("Error in note update 2nd");
                                           response(res).failure(err);
                                       });



                                   }).catch(function(err){
                                       // console.log("Error in 2nd meeting update");
                                       t.rollback();
                                       response(res).failure(err);
                                   });



                          

                         }).catch(function(err){
                            response(res).failure(err);
                         });
                         
            
                  }).catch(function(err){

                      t.rollback();
                      response(res).failure(err);
                  });



                    /**** lead update end ****/




                 }
                

            });
 
       
           
        }).catch(function(err){
              t.rollback();
             response(res).failure(err);

        });
    



    }else
    {
      
          db.lead.update({

           employee_id : req.body.EmployeeId || null,
           isReassigned: 1,
           seen:0,
           contact_id : null,
           organization_id:null,
           last_updated: currentTime
         },
         {
             where : { lead_id : leadObject.lead_id  },
             transaction:t
         }
         ).then(function(lu)
         {

            // console.log("Condition this is running .....................");
             var tempLeadLog = {

                        lead_id : leadObject.lead_id,
                        old_employee_id : leadObject.employee_id,
                        new_employee_id : req.body.EmployeeId || null,
                        assigned_by_id : req.currentUser.EmployeeId,
                        initial_create : currentTime,
                        last_updated : currentTime
            };
              db.meeting.update({

                                    employee_id: req.body.EmployeeId || null,
                                    last_updated: currentTime
                                  },{
                                      where: {lead_id: leadObject.lead_id },
                                      transaction:t
                                  }).then(function(mu){



                                     db.lead_stage_calculation.update({

                                      employee_id: req.body.EmployeeId || null,
                                      last_updated: currentTime

                                     },{
                                      where: {lead_id: leadObject.lead_id },
                                      transaction:t

                                     }).then(function(lsu){


                                         db.note.update({

                                          employee_id: req.body.EmployeeId || null,
                                          last_updated: currentTime

                                           },{
                                            where: {lead_id: leadObject.lead_id },
                                            transaction:t


                                         }).then(function(nu){



                                                db.meeting.findAll({
                                                  where: {lead_id : leadObject.lead_id }
                                                }).then(function(meetings){

                                                    var meetingToUpdateIds = [];
                                                    var contactToUpdateIds = [];

                                                    meetings.map(function(m){
                                                      meetingToUpdateIds.push(m.meeting_id);
                                                      contactToUpdateIds.push(m.contact_id);
                                                    });


                                                    db.note.update({

                                                      employee_id: req.body.EmployeeId || null,
                                                      last_updated: currentTime

                                                       },{
                                                        where: {meeting_id: {in:meetingToUpdateIds } },
                                                        transaction:t


                                                    }).then(function(nu2){

                                                         db.product_lead_mapping.update({

                                                            employee_id: req.body.EmployeeId || null,
                                                            last_updated: currentTime
                                                          },{
                                                              where: {lead_id: leadObject.lead_id },
                                                              transaction:t
                                                          }).then(function(plm){

                                                               db.task.update({

                                                                  employee_id: req.body.EmployeeId || null,
                                                                  last_updated: currentTime
                                                                },{
                                                                    where: {lead_id: leadObject.lead_id },
                                                                    transaction:t
                                                                }).then(function(tu){

                                                                     db.lead_log.create(tempLeadLog,{transaction:t}).then(function(llog)
                                                                    {
                                                                              // console.log(llog.id);
                                                                              callb(true);


                                                                    }).catch(function(err){

                                                                                       t.rollback();
                                                                                       response(res).failure(err);
                                                                    });

                                                                 }).catch(function(err){
                                                                     t.rollback();
                                                                     response(res).failure(err);
                                                                 });


                                                               

                                                          }).catch(function(err){
                                                              // console.log("Error in product lead mapping 1");
                                                              t.rollback();
                                                              response(res).failure(err);
                                                          });


                                                    }).catch(function(err){
                                                        
                                                         t.rollback();
                                                         response(res).failure(err);

                                                    });


                                                

                                                   


                                                }).catch(function(err){
                                                    t.rollback();
                                                    response(res).failure(err);
                                                });
                                               



                                         }).catch(function(err){
                                              t.rollback();
                                              // console.log("error in note update");
                                              response(res).failure(err);
                                         });

                                        

                                    }).catch(function(err){

                                             t.rollback();
                                             response(res).failure(err);

                                    });

                                    
                                   

                                  }).catch(function(err){

                                       t.rollback();
                                       // console.log("Error in meeting update");
                                       //res.send(err);
                                       response(res).failure(err);

                                  });
            
         }).catch(function(err){

             t.rollback();
             response(res).failure(err);
         });





    }  
      
     


}

function returnContact(obContact)
{
    var jsonContact = {};
    //// console.log("Contact Id is ---->"+contact_id);
    
        jsonContact = {
           
            ContactId: obContact.contact_id || null,
            //AccountId: obContact.account_id || null,
            Name : obContact.name || null,
            Number : obContact.number || null,
            Email : obContact.email || null,
            Address : obContact.address || null,
            Seen:obContact.seen,
            IsLink : obContact.isLink || null,
            EmployeeId: obContact.employee_id || null,
            OrganizationId: obContact.organization_id || null,
            AgeGroup: obContact.age_group,
            Income: obContact.income,
            Dependent: obContact.dependent,
            AddPicklist1: obContact.add_picklist_1,
            AddPicklist2: obContact.add_picklist_2,
            AddPicklist3: obContact.add_picklist_3,
            AddNum1: obContact.add_num_field_1,
            AddNum2: obContact.add_num_field_2,
            AddText1: obContact.add_text_field_1,
            AddText2: obContact.add_text_field_2,
            AddDate1: obContact.add_date_field_1,
            AddDate2: obContact.add_date_field_2,

            InitialCreate:obContact.initial_create || null,
            LastUpdated:obContact.last_updated || null,
            //Active: obContact.active

        }
    

    return jsonContact;


}
