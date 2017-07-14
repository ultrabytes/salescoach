"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var log = require("../../api_logs/create_logs");
var logFile = "task_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');
 
exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {
        if (err) {
            log.run(req,response(res).customError(err),logFile);
            response(res).failure(err);
        }

        if(status == false)
        {
           log.run(req,response(res).customError("Not Authorized !"),logFile);
           response(res).failure("Not Authorized !");
        } 

        else {
            db.task.findAndCountAll({
                where: q || {},
                include: [
                    { model:db.contact },
                    { model : db.lead, where: { active: true },required :false , include: [{ model: db.lead_stage_calculation , where:{active: 1},required:false},{ model: db.lead_status_calculation , where:{active: 1},required:false},{model:db.lead_doc_mapping, where:{active:1},required:false},{ model: db.contact , where: {  $and: [{contact_id: { $ne : null }}, { active: true }]  }, required: false}]}
                ],
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]

            }).then(function (Task) {
               // res.send(Task);
                var obContact;
                var obLead;
                var items = Task.rows.map(function (c) {

                     try{
                            obContact = returnContact(c.contact);
                           
                    }catch(e)
                    {
                        //// console.log("error---->"+e);
                        obContact = c.contact;
                    }

                    try{
                           if(c.lead && c.lead.contact != null ){
                            obLead = returnLead(c.lead);

                               obLead.LeadStatusCalculation = [];

                               if(c.lead.lead_status_calculations){

                                   obLead.LeadStatusCalculation = c.lead.lead_status_calculations.map(function(i){
                                       return i.toModel();
                                   });
                               }

                               if(c.lead && c.lead.lead_doc_mappings){
                                   obLead.LeadDocMapping = c.lead.lead_doc_mappings.map(function(i){
                                       return i.toModel();
                                   });

                               }else{
                                   obLead.LeadDocMapping = null;
                               }

                        }else{
                            obLead = null;
                        }

                     }catch(e)
                     {
                          obLead = c.lead
                     }   
                    return c.toModel(obContact,obLead);
                });

                 var moreRecordsAvailable = false;

                if(Task.count > Task.rows.length)
                {
                     moreRecordsAvailable = true;
                }



                //response(res).page(items);
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


            }).catch(function (err) {

                log.run(req,response(res).customError(err),logFile);
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || req.params.TaskId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.task.findById(id)
            .then(function (task) {
                toEntityUpdate(task, Model, req.currentUser,action)
                    .save()
                    .then(function (entity) {

                        log.run(req,entity.toModelUpdate(),logFile);
                        response(res).data(entity.toModelUpdate());
                    })
                    .catch(function (err) {
                        log.run(req,response(res).customError(err),logFile);
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                log.run(req,response(res).customError(err),logFile);
                response(res).failure(err);
            });
    } else {


        action = "create";

        var currentTime = new Date().getTime();
        var reqInfo = { cont_id : null ,ld_id : null ,currentTime : currentTime  };
        var localId = req.body.LocalId || null;

        return db.sequelize.transaction().then(function (t){

            return createContact(req,res,reqInfo,t,function(obCot){

                 return createLead(req,res,reqInfo,t,function(obLd){
                  
                    return db.task.create(toEntity({}, Model, req.currentUser,action,reqInfo.cont_id,reqInfo.ld_id),{transaction:t}).then(function(entity){

                       t.commit();

                         setTimeout(function(){

                                   return db.task.find({

                            where : { task_id : entity.task_id  },
                            include : [
                               {model: db.contact },
                               {model: db.lead , include: [{ model: db.lead_stage_calculation }]}
                            ]
                       }).then(function(tks){
                             var obContact;
                             var obLead;


                               try{

                                    obContact = tks.contact.toModel();
                                    log.run(req,obContact,"contact_log.txt");


                                  }catch(e)
                                  {
                                    
                                    obContact = tks.contact || null;

                                     if(req.body.ContactId)
                                     {
                                        
                                       obContact = obCot;
                                        
                                     }


                                  }


                                  try{


                                        obLead = returnLead(tks.lead);;
                                        log.run(req,obLead,"lead_log.txt");


                                      }catch(e){
                                        
                                        obLead = tks.lead || null;

                                         if(req.body.LeadId)
                                         {
                                            
                                           obLead = obLd;
                                            
                                         }


                                      }



                                      response(res).data(entity.toModelPost(obContact,obLead,localId));
                       });

                         },1000);


                    });


                 });



            });
        });

           
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.task.find({
        where: {
            task_id: id
        },
        include: [
            { all: true }
        ]
    }).then(function (entity) {
         var obContact;
         var obLead;
         try{
            obContact = returnContact(entity.contact);

        }catch(e)
        {
            obContact = entity.contact
        }

        try{
            obLead = returnLead(entity.lead);

        }catch(e)
        {
            obLead = entity.lead
        }
         log.run(req,entity.toModel(obContact,obLead),logFile);
        response(res).data(entity.toModel(obContact,obLead));
    }).catch(function (err) {
        log.run(req,response(res).customError(err),logFile);
        response(res).failure(err);
    });
};

exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.task.findById(id)
            .then(function (object) {
                object.active = false;
                object.last_updated = currentTime;
                object.save()
                    .then(function (entity) {
                        log.run(req,response(res).returnSuccess(),logFile);
                        response(res).success();
                    })
                    .catch(function (err) {
                        log.run(req,response(res).customError(err),logFile);
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                log.run(req,response(res).customError(err),logFile);
                response(res).failure(err);
            });
};

var toEntity = function (entity, data, currentUser,action,contact_id,lead_id) {    
    
    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.reminder = data.Reminder;     
    entity.dueDate = data.Duedate;
    entity.dueDateTime = data.Duedatetime;
    entity.completedOn = data.Completedon;
    entity.completedOnDate = data.Completedondate;
    entity.contact_id = contact_id;    
    entity.lead_id = lead_id; 
    entity.employee_id = currentUser.EmployeeId; 
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    
    return entity;
};


var toEntityUpdate = function (entity, data, currentUser,action) {    
    
    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.reminder = data.Reminder;     
    entity.dueDate = data.Duedate;
    entity.dueDateTime = data.Duedatetime;
    entity.completedOn = data.Completedon;
    entity.completedOnDate = data.Completedondate;
    entity.contact_id = data.ContactId;    
    entity.lead_id = data.LeadId; 
    //entity.employee_id = currentUser.EmployeeId; 
    entity.last_updated = new Date().getTime();
  
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

function createContact(req,res,reqInfo,t,callback)
{
  var obContact = null;
   if(req.body.Contact){
      var objectContact = req.body.Contact;
      objectContact.name = objectContact.Name;
      objectContact.account_id = req.currentUser.AccountId;
      objectContact.number = objectContact.Number;
      objectContact.email = objectContact.Email;
      objectContact.address = objectContact.Address;
      objectContact.seen = objectContact.Seen || 1;
      objectContact.isLink = objectContact.IsLink;
      objectContact.employee_id = req.currentUser.EmployeeId;
      objectContact.organization_id = reqInfo.org_id || null;
      objectContact.initial_create = reqInfo.currentTime;
      objectContact.last_updated =  reqInfo.currentTime;
       objectContact.age_group = objectContact.AgeGroup;
       objectContact.income = objectContact.Income;
       objectContact.dependent = objectContact.Dependent;
       objectContact.add_picklist_1 = objectContact.AddPicklist1;
       objectContact.add_picklist_2 = objectContact.AddPicklist2;
       objectContact.add_picklist_3 = objectContact.AddPicklist3;
       objectContact.add_num_field = objectContact.AddNum1;
       objectContact.add_num_field_2 = objectContact.AddNum2;
       objectContact.add_text_field_1 =objectContact.AddText1;
       objectContact.add_text_field_2 = objectContact. AddText2;
       objectContact.add_date_field_1 =objectContact. AddDate1;
       objectContact.add_date_field_2 =objectContact.AddDate2;
      return db.contact.create(objectContact,{transaction:t}).then(function(cont)
     {
        
        reqInfo.cont_id = cont.contact_id;
        callback(true);


     }).catch(function(err){
         t.rollback();
         response(res).failure(err);
     });

   }else{


        if(req.body.ContactId){

             db.contact.find(
              {
          where: { contact_id : req.body.ContactId }
           
       }).then(function(c)
       {
                
          
         try{
            reqInfo.cont_id = c.contact_id;
            obContact = c.toModel();
            //reqInfo.cont_id = obContact.ContactId;
            //reqInfo.cont_id = req.body.ContactId;
         }catch(e)
         {

            
            obContact = null;
         }

         callback(obContact);


        }).catch(function(err){
            t.rollback();
            response(res).failure(err);
             
        });


        }else{

           callback(null);
        }
       
   }

}

function createLead(req,res,reqInfo,t,leadResponse)
{
    var obLd = null;
  if(req.body.Lead){
     var objectLead = req.body.Lead;
 

    objectLead.name = objectLead.Name;
    objectLead.account_id = req.currentUser.AccountId;
    objectLead.amount = objectLead.Amount;     
    objectLead.isWon = objectLead.Iswon;
    objectLead.expectedClouserDate = objectLead.Expectedclouserdate;
    objectLead.expectedClouserDateTime = objectLead.Expectedclouserdatetime;
    objectLead.isFresh = objectLead.Isfresh;
    objectLead.commissionRate = objectLead.Commissionrate;
    objectLead.lostReason = objectLead.Lostreason;
    objectLead.prospectsDate = objectLead.Prospectsdate;
    objectLead.contactedDate = objectLead.Contacteddate;
    objectLead.proposalGivenDate = objectLead.Proposalgivendate;
    objectLead.proposal_finalized_date = objectLead.ProposalFinalizedDate;
    objectLead.inNegotiationDate = objectLead.Innegotiationdate;
    objectLead.wonDate = objectLead.Wondate;
    objectLead.lostDate = objectLead.Lostdate;
    objectLead.currentState = objectLead.Currentstate;
    objectLead.amc_id = objectLead.AmcId;
    objectLead.lead_source_id = objectLead.LeadSourceId;
    objectLead.lead_source_sub_string = objectLead.LeadSourceSubString;
    objectLead.product_id = objectLead.ProductId;
    objectLead.organization_id = objectLead.OrganizationId;
    objectLead.won_lost_by_employee_id = objectLead.WonLostByEmployeeId;
    objectLead.won_lost_by_employee_name = objectLead.WonLostByEmployeeName;
     objectLead.contact_id = objectLead.ContactId || reqInfo.cont_id;
     objectLead.employee_id = req.currentUser.EmployeeId;
     objectLead.seen = objectLead.Seen || 1;
     objectLead.is_individual = objectLead.IsIndividual;
      objectLead.opportunity = objectLead.Opportunity;
      objectLead.status_calculation_id = objectLead.StatusCalculationId;
      objectLead.currentStatus = objectLead.CurrentStatus;
      objectLead.rating = objectLead.Rating;
     objectLead.initial_create = reqInfo.currentTime;
     objectLead.last_updated =  reqInfo.currentTime;
     db.lead.create(objectLead,{transaction:t}).then(function(lead)
     {
        reqInfo.ld_id = lead.lead_id;
        if(req.body.Lead.LeadStageCalculation){

            
            createLeadStageCalculations2(req.body.Lead.LeadStageCalculation,req,res,lead,t,reqInfo,function(lscR){

                leadResponse(true);
            });


        }else{

        leadResponse(true);
        }
     }).catch(function(err){
         t.rollback();
         response(res).failure(err);
     });

   }else{

            if(req.body.LeadId)
            {
                db.lead.find({

                    where: { lead_id : req.body.LeadId},
                    include: [{ model: db.lead_stage_calculation  }]

                }).then(function(l){
                          
                        try{
                            reqInfo.ld_id = l.lead_id;
                            obLd = l.toModel();


                        }catch(err){

                            obLd = null;

                        }

                       leadResponse(obLd);




                }).catch(function(err){
                    t.rollback();
                    response(res).failure(err);
                });
    

            }else{

                    leadResponse(null);
            }

   }

}

function createLeadStageCalculations2(LeadStageCalculations,req,res,entity,t,reqInfo,lscResponse){

  var objectLSC = req.body.Lead.LeadStageCalculation;
    var realObjectLSC = [];

    var tempJson;
   

     for(var i in objectLSC)
    {
       
        var lsc = objectLSC[i];
       
        tempJson = {  
          account_id: req.currentUser.AccountId,
          active : lsc.Active || null,
          number_of_days : lsc.NumberOfDays || null,
          stage_name : lsc.StageName || null,
          status : lsc.Status || null,
          start_date : lsc.StartDate || null,
          end_date : lsc.EndDate || null,
          initial_position_level: lsc.InitialPositionLevel || null,
          updated_position_level: lsc.UpdatedPositionLevel || null,
          stage_setting_id: lsc.StageSettingId || null,
          lead_id : entity.lead_id,
          employee_id: entity.employee_id,
          initial_create : entity.initial_create,
          last_updated : entity.last_updated
          

       }

        realObjectLSC.push(tempJson);
    }

    db.lead_stage_calculation.bulkCreate(realObjectLSC,{transaction:t}).then(function(lsc){

        
        lscResponse(lsc);
        

    }).catch(function(err){
         t.rollback();
         response(res).failure(err);
    });

  
    
}

function createLeadStageCalculations(LeadStageCalculations,req,res,obLead,reqInfo){

  var objectLSC = LeadStageCalculations;
    var realObjectLSC = [];

    var tempJson;
   

     for(var i in objectLSC)
    {
       
        var lsc = objectLSC[i];
       
        tempJson = {  
          account_id: req.currentUser.AccountId,
          active : lsc.Active,
          number_of_days : lsc.NumberOfDays || null,
          stage_name : lsc.StageName || null,
          status : lsc.Status || null,
          start_date : lsc.StartDate || null,
          end_date : lsc.EndDate || null,
          initial_position_level: lsc.InitialPositionLevel || null,
          updated_position_level: lsc.UpdatedPositionLevel || null,
          stage_setting_id: lsc.StageSettingId || null,
          lead_id : obLead.lead_id,
          employee_id: obLead.employee_id,
          initial_create : obLead.initial_create,
          last_updated : obLead.last_updated
          

       }

        realObjectLSC.push(tempJson);
    }

    db.lead_stage_calculation.bulkCreate(realObjectLSC).then(function(lsc){

        db.lead_stage_calculation.findAll({

          where: { lead_id : reqInfo.ld_id }
        }).then(function(lscObject){
               
        }).catch(function(err){
            response(res).failure(err);
        });
        
        

    }).catch(function(err){
 
         response(res).failure(err);
    });

    
}


function returnContact(obContact)
{
    var jsonContact = {
       
        ContactId: obContact.contact_id,
        Name : obContact.name,
        Number : obContact.number,
        Email : obContact.email,
        Address : obContact.address,
        Seen : obContact.seen,
        IsLink : obContact.isLink,
        OrganizationId: obContact.organization_id,
        EmployeeId:obContact.employee_id,
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

        InitialCreate:obContact.initial_create,
        LastUpdated:obContact.last_updated,
        //Active: obContact.active

    }


    return jsonContact;


}


function returnLead(obLead)
{

    var obLSC = null;
    if(obLead.lead_stage_calculations){


        var obLSC = obLead.lead_stage_calculations.map(function (c) {
                    return c.toModel();
                });
    }
    var  jsonLead = {

      LeadId: obLead.lead_id,
      Name: obLead.name,
      Amount: obLead.amount ,
      Iswon: obLead.isWon,
      Expectedclouserdate: obLead.expectedClouserDate || null,
      Expectedclouserdatetime: obLead.expectedClouserDateTime,
      Isfresh: obLead.isFresh,
      Commissionrate: obLead.commissionRate,
      Lostreason: obLead.lostReason,
      Prospectsdate: obLead.prospectsDate,
      Contacteddate: obLead.contactedDate,
      Proposalgivendate: obLead.proposalGivenDate,
      ProposalFinalizedDate: obLead.proposal_finalized_date,
      Innegotiationdate: obLead.inNegotiationDate,
      Wondate: obLead.wonDate,
      Lostdate: obLead.lostDate,
      Currentstate: obLead.currentState,
      ContactId: obLead.contact_id,
      Seen: obLead.seen,
      IsIndividual: obLead.is_individual,
      AmcId: obLead.amc_id,
      EmployeeId: obLead.employee_id,
      LeadSourceId: obLead.lead_source_id,
      LeadSourceSubString: obLead.lead_source_sub_string,
      ProductId: obLead.product_id,
      OrganizationId: obLead.organization_id,
      WonLostByEmployeeId: obLead.won_lost_by_employee_id,
      WonLostByEmployeeName: obLead.won_lost_by_employee_name,
      LeadStageCalculation: obLSC,
        StageCalculationId:obLead.stage_calculation_id,
        Opportunity:obLead.opportunity,
        StatusCalculationId:obLead.status_calculation_id,
        CurrentStatus:obLead.currentStatus,
        Rating:obLead.rating,
      InitialCreate: obLead.initial_create,
      LastUpdated: obLead.last_updated,
      //Active: obLead.active


      
    }

    return jsonLead;
}


