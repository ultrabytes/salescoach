"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.contactAssign = function(req,res)
{
    var currentTime = new Date().getTime();
    var filters = req.query;
    var currentUser = req.currentUser;
    var ContactIds = req.body.ContactIds || null;
    var EmployeeId = req.body.EmployeeId || null;
   return db.sequelize.transaction(function(t){

    return db.contact.findAll(
    {
      where : { contact_id : { in: ContactIds }  }


    }).then(function(contacts)
    {
       if(contacts.length > 0)
       {
           return db.contact.update(
           {

                employee_id : req.body.EmployeeId || null,
                seen: 0,
                isReassigned: 1,
                last_updated: currentTime

           },
           {
              where : { contact_id : { in : ContactIds }  },
              transaction:t

           }
           ).then(function(uc)
           {
              var contactLogObject = [];
              var tempContLog;
              var orgIds = [];

               for(var i in  contacts)
               {
                   var con = contacts[i];
                   orgIds.push(con.organization_id);

                   tempContLog = {

                      contact_id : con.contact_id,
                      old_employee_id : con.employee_id,
                      new_employee_id : EmployeeId,
                      assigned_by_id : currentUser.EmployeeId,
                      initial_create : currentTime,
                      last_updated : currentTime
                   };

                   contactLogObject.push(tempContLog);


                }

                return db.lead.update({

                  employee_id : EmployeeId,
                  last_updated: currentTime,
                        seen: 0
                },
                {
                  where : { contact_id : { in: ContactIds } },
                  transaction: t
                }
                ).then(function(ldu)
                {

                  return db.meeting.update(
                  {
                    employee_id : EmployeeId,
                    last_updated: currentTime

                  },
                  {
                    where : { contact_id : { in: ContactIds } },
                    transaction: t

                  }
                  ).then(function(mtu)
                  {

                     return db.task.update(
                     {
                       
                       employee_id : EmployeeId,
                       last_updated: currentTime

                     },
                     {
                        where : { contact_id : { in: ContactIds } },
                        transaction: t

                     }).then(function(tup)
                     {


                          return db.note.update(
                         {
                           
                           employee_id : EmployeeId,
                           last_updated: currentTime

                         },
                         {
                            where : { contact_id : { in: ContactIds } },
                            transaction: t

                         }).then(function(nu)
                         {
                                  

                            return db.organization.update(
                             {
                               
                               employee_id : EmployeeId,
                               last_updated: currentTime

                             },
                             {
                                where : { organization_id : { in: orgIds } },
                                transaction: t

                             }).then(function(orgUp)
                             {

                                return db.lead.findAll({

                                  where : { contact_id : { in: ContactIds } }

                                }).then(function(lds){

                                  var ldsToNotes = [];
                                   lds.map(function(l){
                                      ldsToNotes.push(l.lead_id);
                                   });

                                   return db.note.update({
                               
                                     employee_id : EmployeeId,
                                     last_updated: currentTime

                                   },
                                   {
                                      where : { lead_id : { in: ldsToNotes } },
                                      transaction: t

                                   }).then(function(nlu){
                                      return db.meeting.findAll({

                                          where: {lead_id: {in: ldsToNotes}}
                                      }).then(function(mts){
                                        
                                           var meetingToNoteIds = [];
                                           mts.map(function(m){

                                                 meetingToNoteIds.push(m.meeting_id);
                                           });

                                           return db.note.update({
                               
                                             employee_id : EmployeeId,
                                             last_updated: currentTime

                                           },
                                           {
                                              where : { meeting_id : { in: meetingToNoteIds } },
                                              transaction: t

                                           }).then(function(){

                                               return db.product_lead_mapping.update({
                               
                                                   employee_id : EmployeeId,
                                                   last_updated: currentTime

                                                 },
                                                 {
                                                    where : { lead_id : { in: ldsToNotes } },
                                                    transaction: t

                                                  }).then(function(){

                                                      return db.lead_doc_mapping.update({
                                                          employee_id : EmployeeId,
                                                          last_updated: currentTime

                                                      },{
                                                          where : { lead_id : { in: ldsToNotes } },
                                                          transaction: t

                                                      }).then(function(){

                                                          return db.lead_stage_calculation.update({

                                                              employee_id : EmployeeId,
                                                              last_updated: currentTime

                                                          },{

                                                              where : { lead_id : { in: ldsToNotes } },
                                                              transaction: t

                                                          }).then(function(){

                                                              return db.lead_status_calculation.update({

                                                                  employee_id : EmployeeId,
                                                                  last_updated: currentTime

                                                              },{

                                                                  where : { lead_id : { in: ldsToNotes } },
                                                                  transaction: t

                                                              }).then(function(){

                                                                  return db.contact_log.bulkCreate(contactLogObject,{transaction:t});


                                                              }).catch(function(){

                                                                  t.rollback();
                                                                  response(res).failure(err);

                                                              });


                                                          }).catch(function(){

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

                                                   //return db.contact_log.bulkCreate(contactLogObject,{transaction:t});
                                           }).catch(function(err){

                                             t.rollback();
                                             response(res).failure(err);

                                          });


                                      }).catch(function(err){

                                         t.rollback();
                                         response(res).failure(err);

                                      });

                                          // return db.contact_log.bulkCreate(contactLogObject,{transaction:t});
                                        

                                   }).catch(function(err){

                                       t.rollback();
                                       response(res).failure(err);

                                    });

                                }).catch(function(err){

                                   t.rollback();
                                   response(res).failure(err);

                                });

                                 // return db.contact_log.bulkCreate(contactLogObject,{transaction:t});

                             });
                                 
                            
                              

                         });




                     });


                      

                  });

                  

                });
              
                


           });

       }else
       {
                         res.json({
                          success: false,
                          ErrorCode: 116,
                          message: 'Unable to find contacts of these ids',
                          ServerCurrentTime: new Date().getTime(),
                          
                          });
       }
        //res.json({ Contacts : contacts.length });

    }).catch(function (err) {
       response(res).failure(err);
     }
    );


  }).then(function()
  {
                        return db.contact_log.findAll(
                          {
                            where : { initial_create : currentTime }

                          }).then(function(cls)
                          {
                              // console.log("cls is ------->"+cls);

                              var items = cls.map(function (c) {
                                  return c.toModel();
                               });
                              
                              response(res).page(items);

                          });

  }).catch(function(err)
  {
     response(res).failure(err);
  });


   

   
};

