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
    whereClause(req,res,filters, currentUser, function(err, clause,q,limit,offset,al,status){
        if(err) {
            response(res).failure(err);
        }

        if(status == false)
        {
           response(res).failure("Not Authorized !");
        }

        else {
            db.agent.findAndCountAll({
                where : q || {},
                include:[
                {
                  model: db.agent_stage_calculation,where:{active: 1},required:false
                }],
                limit: limit , offset: offset,
               order: [["last_updated","ASC"]]

            }).then(function (Agents) {

                // res.send(Agents);
                var items = Agents.rows.map(function (c) {

                    if(c.employee_id == filters.emp_id)
                    {
                            var IsReassigned = 0;
                    }else
                    {
                            var IsReassigned = 1;
                    }

                    var agentObject =  c.toModel(currentUser,IsReassigned);

                    if(c.agent_stage_calculations){

                          agentObject.AgentStageCalculations = c.agent_stage_calculations.map(function(as){
                              return as.toModel();
                          });

                    }else{
                      agentObject.AgentStageCalculations = null;
                    }

                    return agentObject;
                });

                var moreRecordsAvailable = false;

                    if(Agents.count > Agents.rows.length)
                    {
                         moreRecordsAvailable = true;
                    }

                  res.json({
                      success: true,
                      ErrorCode : 100,
                      message: 'completed sucessfully',
                      items: items,
                      recordCount: items.length,
                      ServerCurrentTime: new Date().getTime(),
                      moreRecordsAvailable: moreRecordsAvailable
                      });



                //response(res).page(items);
            }).catch(function(err){
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {

    var Model = req.body;
    var data = req.body;
    var localIdsObject = {};
     var localId = req.body.LocalId || null;

    var id = req.params.id || null;
    var action = "";
    var currentTime = new Date().getTime();

    if ((id && id != 0)) {

        action ="update";
        var stageCal = req.body.StageCalculationId || null;
        getAuthorizedUsers(req,res,function(status)
    {

          //res.send("status is ------>"+status);
          if(status == true)
          {

               return db.sequelize.transaction().then(function (t) {

                  db.agent.find({
                     where: {agent_id: id}
                  }).then(function(ag){



                      return db.agent.update(toAgentEntity(data,req,res,"update",currentTime),{
                        where: {agent_id: id },
                        transaction:t
                      }).then(function(au){
                          if(!data.AgentStageCalculations){
                              data.AgentStageCalculations = [];
                          }
                          if(data.AgentStageCalculations){

                               async.forEachSeries(data.AgentStageCalculations,function(Object,callback){
                                  db.agent_stage_calculation.count({
                                      where: {stage_calculation_id: Object.StageCalculationId}
                                  }).then(function(c){


                                      if(c > 0){

                                         return db.agent_stage_calculation.update(toAgentStageCalculationEntity(Object,req,res,"update",currentTime,ag),{
                                          where: {stage_calculation_id:  Object.StageCalculationId},
                                          transaction:t
                                         }).then(function(aSCU){
                                               localIdsObject[Object.StageCalculationId] = Object.LocalId || null;
                                               callback();
                                         }).catch(function(err){
                                             t.rollback();
                                             // console.log("Error in Agent Put agent stage calculation update");
                                             response(res).failure(err);
                                         });

                                      }else{

                                           return db.agent_stage_calculation.create(toAgentStageCalculationEntity(Object,req,res,"create",currentTime,ag),{transaction:t}).then(function(aSCC){

                                                 localIdsObject[aSCC.stage_calculation_id] = Object.LocalId || null;
                                                 callback();
                                           }).catch(function(err){
                                              t.rollback();
                                              // console.log("Error in Agent Put agent stage calculation create");
                                              response(res).failure(err);
                                           });

                                      }

                                  }).catch(function(err){
                                      t.rollback();
                                      // console.log("Error in Agent Put count agent stage calculation");
                                      response(res).failure(err);
                                  });

                               },function(err){

                                  if (err) return next(err);

                                   var idASC = null;

                                   //return res.send(localIdsObject);

                                   for(var i in localIdsObject){

                                       if(localIdsObject[i] == stageCal){

                                           // console.log("value at"+i+"  is "+localIdsObject[i]);
                                           // console.log("local id is ------->"+localId);
                                           idASC = i;
                                       }
                                   }



                                   db.agent_stage_calculation.count({
                                       where:{stage_calculation_id: stageCal}
                                   }).then(function(aCount){

                                            if(aCount > 0){
                                                idASC = stageCal;
                                            }


                                       return db.agent.update({
                                           stage_calculation_id: idASC
                                       },{
                                           where:{agent_id: id},
                                           transaction:t
                                       }).then(function(){

                                           t.commit();
                                           setTimeout(function(){


                                               db.agent.find({
                                                   where: {agent_id: id},
                                                   include: [{model: db.agent_stage_calculation, where: {last_updated:currentTime}, required:false}]
                                               }).then(function(ag){



                                                   var agentObejct = ag.toModel();
                                                   agentObejct.LocalId = localId;
                                                   if(ag.agent_stage_calculations){
                                                       agentObejct.AgentStageCalculations = ag.agent_stage_calculations.map(function(asc){
                                                           var ascObject = asc.toModel();
                                                           ascObject.LocalId = localIdsObject[asc.stage_calculation_id];

                                                           return ascObject;

                                                       });
                                                   }else{
                                                       agentObejct.AgentStageCalculations = null;
                                                   }

                                                   response(res).data(agentObejct);


                                               }).catch(function(err){


                                                   response(res).failure(err);
                                               });




                                           },1000);

                                       }).catch(function(err){
                                           t.rollback();
                                           response(res).failure(err);
                                       });

                                   }).catch(function(err){
                                       t.rollback();
                                       response(res).failure(err);
                                   });

                               });
                          }else{
                              t.rollback();
                              response(res).failure(err);
                          }


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


            }else
            {
                 response(res).failure("Not Authorized !");

            }





    });
    } else {
        action = "create";
        var stageCal = req.body.StageCalculationId || null;

         return db.sequelize.transaction().then(function (t) {

             return db.agent.create(toAgentEntity(data,req,res,"create",currentTime),{transaction:t}).then(function(ac){

                  if(!data.AgentStageCalculations){
                      data.AgentStageCalculations = [];
                  }

                 if(data.AgentStageCalculations){

                     async.forEachSeries(data.AgentStageCalculations,function(object,callback){

                         return db.agent_stage_calculation.create(toAgentStageCalculationEntity(object,req,res,"create",currentTime,ac),{transaction:t}).then(function(aSC){

                             localIdsObject[aSC.stage_calculation_id] = object.LocalId || null;
                             callback();

                         }).catch(function(err){
                            t.rollback();
                            response(res).failure(err);
                         });


                     },function(err){


                          if (err) return next(err);

                         var idASC = null;

                         //return res.send(localIdsObject);

                         for(var i in localIdsObject){

                             if(localIdsObject[i] == stageCal){

                                 // console.log("value at"+i+"  is "+localIdsObject[i]);
                                 // console.log("local id is ------->"+localId);
                                 idASC = i;
                             }
                         }

                         return db.agent_stage_calculation.count({
                             where: {stage_calculation_id: stageCal}
                         }).then(function(aCount){

                             if(aCount > 0){
                                 idASC = stageCal;
                             }

                             return db.agent.update({
                                 stage_calculation_id: idASC
                             },{
                                 where: {agent_id : ac.agent_id},
                                 transaction:t
                             }).then(function(au){


                                 commitResponse(t,ac,localId,localIdsObject,req,res,currentTime);

                             }).catch(function(err){

                                 t.rollback();
                                 response(res).failure(err);
                             });

                         }).catch(function(err){

                             t.rollback();
                             response(res).failure(err);

                         });


                     });

                 }else{

                     t.rollback();
                     response(res).failure(err);

                 }

            }).catch(function(err){

                 response(res).failure(err);

            });

        }).catch(function(err){
             t.rollback();
            response(res).failure(err);
        });


        // db.agent.create(toAgentEntity(),).then(function(){

        // });



    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.agent.find({
        where: {
            agent_id: id
        },
        include: [
            {all: true}
        ]
    }).then(function (entity) {
        response(res).data(entity.toModel(req.currentUser));
    }).catch(function (err) {
        response(res).failure(err);
    });
};


exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.agent.findById(id)
            .then(function (object) {
                object.active = false;
                object.last_updated = currentTime;
                object.save()
                    .then(function (entity) {
                        db.meeting.update({
                          active: false,
                          last_updated:currentTime
                        },
                        {
                          where: {  agent_id : id }


                        }).then(function(mu)
                        {


                            db.note.update({
                              active: false,
                              last_updated:currentTime
                            },
                            {
                              where: {  agent_id : id }


                            }).then(function(nu)
                            {
                                db.agent_stage_calculation.update({

                                  active: 0,
                                  last_updated:currentTime

                                },{

                                  where: {  agent_id : id }
                                }).then(function(){
                                  response(res).success();
                                });



                            });


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

var toEntity = function (entity, data, currentUser,action) {
    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.phone_number = data.PhoneNumber;
    entity.email = data.Email;
    entity.address = data.Address;
    entity.age_group = data.AgeGroup;
    entity.date_of_birth = data.DateOfBirth;
    entity.income = data.Income;
    entity.experience = data.Experience;
    entity.status = data.Status;
    entity.prospects_date = data.ProspectsDate;
    entity.contacted_date = data.ContactedDate;
    entity.interviewed_date = data.InterviewedDate;
    entity.selected_date = data.SelectedDate;
    entity.expectedClouserDate = data.ExpectedClosureDate;
    entity.trained_date = data.TrainedDate;
    entity.currentState = data.Currentstate;
    entity.organisationName = data.Organizationname
    entity.rejectionReason = data.RejectionReason;
    entity.notInterestedReason = data.Notinterestedreason;
    entity.keyMilestone1 = data.Keymilestone1;
    entity.keyMilestone2 = data.Keymilestone2;
    entity.keyMilestone3 = data.Keymilestone3;
    entity.keyMilestone4 = data.Keymilestone4;
    entity.keyMilestone5 = data.Keymilestone5;
    entity.keyMilestone6 = data.Keymilestone6;

    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.employee_id = currentUser.EmployeeId;
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    entity.agent_stage_id = data.AgentStageId;

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



        if(al){

              if(al.description == "Above Manager"){

                 aboveManager = 1;
              }

        }

         if(al && al.access_level == 2)
         {
          // condition 1



                      reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                                empObject.map(function(e){

                                      empArray.push(e.employee_id);
                               });


                                if(filters.timestamp && filters.emp_id)
                     {
                          empArray.push(currentUser.EmployeeId);
                          var empId = parseInt(filters.emp_id);


                           if(empArray.indexOf(empId) != -1)
                           {

                              q = {$or:[{employee_id: filters.emp_id,last_updated : { $gt : filters.timestamp }}, { agent_id : { in : [sequelize.literal('select agent_id from agent_log where old_employee_id ='+filters.emp_id)]  } ,last_updated : { $gt : filters.timestamp } }]};
                             callback(null, clause,q,limit,offset,al,true);


                           }else
                           {
                              callback(null, clause,q,limit,offset,al,false);

                           }

                        }else
                        {

                             q = { employee_id : currentUser.EmployeeId };
                             if(filters.timestamp)
                             {
                                q = { employee_id : currentUser.EmployeeId , last_updated : { $gt : filters.timestamp } };
                             }

                             callback(null, clause,q,limit,offset,al,true);
                        }

                       });


         }else if(al && al.access_level == 1)
         {
            // condition 2

             //// console.log("condition 2 is called ----------->");

            if(filters.timestamp && filters.emp_id)
            {
              // condition 3
              // // console.log("condition 3 is called ----------->");
              if(currentUser.EmployeeId == filters.emp_id)
              {
                 //  condition 3.1
                 // // console.log("condition 3.1 is called ----------->");
                  q = {$or:[{employee_id: filters.emp_id,last_updated : { $gt : filters.timestamp }}, {agent_id : { in : [sequelize.literal('select agent_id from agent_log where old_employee_id ='+filters.emp_id)]  } ,last_updated : { $gt : filters.timestamp } }]};
                  callback(null, clause,q,limit,offset,al,true);

              }else
              {
                // condition 3.2

                // // console.log("condition 3.2 is called ----------->");
                 callback(null, clause,q,limit,offset,al,false);
              }


            }else
            {
               // condition 4
               // // console.log("condition 4 is called ----------->");
                 q = { employee_id : currentUser.EmployeeId  };
                 if(filters.timestamp)
                 {
                    q = { employee_id : currentUser.EmployeeId, last_updated : { $gt : filters.timestamp } };
                 }

                 callback(null, clause,q,limit,offset,al,true);

            }


         }else
         {
            // condition 5
            // // console.log("condition 5 is called ----------->");
             callback(null, clause,q,limit,offset,al,false);
         }





    });
};



var  getAuthorizedUsers = function(req,res,callback)
{

    var currentUser = req.currentUser;
    var empArray = [];
    db.agent.findOne({

      where: { agent_id : parseInt(req.params.id) },
      attributes: ['employee_id']
    }).then(function(ag)
    {

        // console.log(ag);

       if(ag && ag.employee_id)
       {

            db.access_level.findOne({

              where : { employee_id : currentUser.EmployeeId },
              attributes : ['access_level'],
              group : ['access_level']


            }).then(function(al)
            {
                 if(al && al.access_level == 2)
                 {

                    // db.employee.findAll({
                    //
                    //       where : { reporting_person : currentUser.EmployeeId },
                    //       attributes : ['employee_id']
                    //
                    //
                    // }).then(function(emp)
                    // {
                    //   if(emp){
                    //
                    //       emp.map(function(item)
                    //       {
                    //           empArray.push(item.employee_id);
                    //
                    //       });
                    //
                    //       db.employee.findAll({
                    //
                    //         where : { reporting_person : { in : empArray }  }
                    //       }).then(function(empS)
                    //       {
                    //
                    //         if(empS)
                    //         {
                    //            empS.map(function(itemS)
                    //            {
                    //
                    //               empArray.push(itemS.employee_id);
                    //
                    //            });
                    //
                    //          }
                    //
                    //
                    //          var  empId = parseInt(ag.employee_id);
                    //
                    //          if(empArray.indexOf(empId) != -1)
                    //          {
                    //                callback(true);
                    //
                    //
                    //          }else
                    //          {
                    //             callback(false);
                    //          }
                    //
                    //
                    //
                    //       });
                    //
                    //     }
                    //
                    //
                    // });

                     reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){
                         empObject.map(function(e){

                             empArray.push(e.employee_id);
                         });

                         empArray.push(currentUser.EmployeeId);

                         var  empId = parseInt(ag.employee_id);

                                  if(empArray.indexOf(empId) != -1)
                                  {
                                        callback(true);


                                  }else
                                  {
                                     callback(false);
                                  }

                     });
                 }else if(al && al.access_level == 1)
                 {
                        var  empId = parseInt(ag.employee_id);
                        if(currentUser.EmployeeId ==  empId)
                        {

                             callback(true);
                        }else
                        {

                            callback(false);
                        }





                 }else
                 {


                     callback(false);
                 }



            });


       }else
       {

          response(res).failure("Agent not found !");
       }

    });





}


var toAgentEntity = function (data, req,res,action,currentTime) {
    var entity= {};
    entity.name = data.Name;
    entity.account_id = data.AccountId || req.currentUser.AccountId;
    entity.phone_number = data.PhoneNumber;
    entity.email = data.Email;
    entity.address = data.Address;
    entity.age_group = data.AgeGroup;
    entity.date_of_birth = data.DateOfBirth;
    entity.income = data.Income;
    entity.experience = data.Experience;
    entity.status = data.Status;
    entity.prospects_date = data.ProspectsDate;
    entity.contacted_date = data.ContactedDate;
    entity.interviewed_date = data.InterviewedDate;
    entity.selected_date = data.SelectedDate;
    entity.expectedClouserDate = data.ExpectedClosureDate;
    entity.trained_date = data.TrainedDate;
    entity.currentState = data.Currentstate;
    entity.organisationName = data.Organizationname
    entity.rejectionReason = data.RejectionReason;
    entity.notInterestedReason = data.Notinterestedreason;
    entity.keyMilestone1 = data.Keymilestone1;
    entity.keyMilestone2 = data.Keymilestone2;
    entity.keyMilestone3 = data.Keymilestone3;
    entity.keyMilestone4 = data.Keymilestone4;
    entity.keyMilestone5 = data.Keymilestone5;
    entity.keyMilestone6 = data.Keymilestone6;
    if(action == "create")
        entity.employee_id =  req.currentUser.EmployeeId;

    entity.last_updated = currentTime;
    if(action == "create")
    {

        entity.initial_create = currentTime;
        entity.last_updated = currentTime;
    }
    entity.agent_stage_id = data.AgentStageId;

    return entity;
};

var toAgentStageCalculationEntity = function(data,req,res,action,currentTime,ag){

     var entity = {};
     entity.stage_name = data.StageName;
     entity.stage_setting_id = data.StageSettingId;
     entity.account_id = req.currentUser.AccountId;
     entity.start_date = data.StartDate;
     entity.end_date = data.EndDate;
     entity.number_of_days = data.NumberOfDays;
     entity.initial_position_level = data.InitialPositionLevel;
     entity.updated_position_level = data.UpdatedPositionLevel;
     entity.status = data.Status;
     entity.extra = data.Extra;
     entity.agent_id = ag.agent_id || null;
     if(action == "create"){
       entity.initial_create = currentTime;
     }
     entity.last_updated = currentTime;
     entity.key_title = data.KeyTitle;
     entity.key_date = data.KeyDate;
     entity.active = data.Active;
     entity.employee_id = ag.employee_id;

     return entity;


}


var commitResponse = function (t,ac,localId,localIdsObject,req,res,currentTime){




                          t.commit().then(function(){

                              db.agent.find({
                                  where: {agent_id: ac.agent_id},
                                  include: [{model: db.agent_stage_calculation, where: {last_updated:currentTime}, required:false}]
                              }).then(function(ag){



                                  var agentObejct = ag.toModel();
                                  agentObejct.LocalId = localId;
                                  if(ag.agent_stage_calculations){
                                      agentObejct.AgentStageCalculations = ag.agent_stage_calculations.map(function(asc){
                                          var ascObject = asc.toModel();
                                          ascObject.LocalId = localIdsObject[asc.stage_calculation_id];

                                          return ascObject;

                                      });
                                  }else{
                                      agentObejct.AgentStageCalculations = null;
                                  }

                                  response(res).data(agentObejct);


                              }).catch(function(err){


                                  response(res).failure(err);
                              });




                          });

};