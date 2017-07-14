"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var log = require("../../api_logs/create_logs");
var logFile = "dsr_summary_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.dsrSubmit = function(req, res){
   var currentTime = new Date().getTime();
    var filters = req.query;

   var tm = parseInt(filters.Team);
   
    var currentUser = req.currentUser;
    //var d = new Date(parseInt(filters.timestamp));
   var endofDate = moment(parseInt(filters.timestamp)).endOf("day").toDate();

  // var ed = new Date(endofDate).toISOString();
  // var filters.totimestamp = new Date(endofDate).getTime();
  //var ed =  moment(filters.totimestamp).tz('Asia/Kolkata').format('')
  // res.send("end date---->"+filters.totimestamp);
   //res.send("Team is --->"+tm);
  

   if(tm == 1){

   whereClause(filters, currentUser,req,res, function(err, clause,q,limit,offset,al,status){
    
      var m_meeting_count;
      var m_calls_count;
       if(err) {
            response(res).failure(err);
        }

        if(status == false)
        {
           response(res).failure("Not Authorized !");
        }else
        {

          db.employee.findAll({

                where: q || {},
                include: [{ model : db.meeting, where: { meeting_type_id: { $ne: null },active:true,last_updated:{ $gte : parseInt(filters.timestamp) , $lt: parseInt(filters.totimestamp) } }, required: false },{ model: db.access_level }]
            }).then(function(employees){
                var Emp = [];
                //res.send(employees);
                var objectMeeting =[];
                var objReportingPerson = [];
                var objAccessLevel = [];
                var empNameObject = [];
                var empIdObject = [];

               async.forEachSeries(employees,function(emp, callback) {

                 empNameObject[emp.employee_id] = emp.first_name || null;
                 var Allmeetings= emp.meetings;

                  if(emp.access_level)
                  {
                      objAccessLevel[emp.employee_id] = emp.access_level.access_level || null;
                  }

                  objReportingPerson[emp.employee_id] = emp.reporting_person;

                  db.sequelize.query("select count('meeting_id') as planned_activities,( SELECT COUNT(*) FROM meeting WHERE (reviewStatus=0 or reviewStatus=1) AND employee_id = "+emp.employee_id+" AND schedule >= "+parseInt(filters.timestamp)+" AND schedule < "+parseInt(filters.totimestamp)+" AND active= 1) as reviewed_activities,( SELECT COUNT(*) FROM meeting WHERE reviewStatus=0  AND employee_id = "+emp.employee_id+" AND schedule >= "+parseInt(filters.timestamp)+" AND schedule < "+parseInt(filters.totimestamp)+" AND active= 1) as zero_reviewed_activities, (SELECT employee_id FROM employee WHERE employee_id = "+emp.employee_id+" LIMIT 1) as Emp,employee_id from meeting where employee_id="+emp.employee_id+"  AND schedule >= "+parseInt(filters.timestamp)+" AND schedule < "+parseInt(filters.totimestamp)+" AND active= 1",{ type: db.sequelize.QueryTypes.SELECT}).then(function(records){

                       var pl_activities = 0;
                       var r_activities = 0;
                       var zero_rv_activities = 0;
                       var reviewStatusObject = [];
                       var employeeId = null;
                       var empHrObject = [];

                       

                

                          var rc = records[0];

                          reviewStatusObject[employeeId] = 0;
                          pl_activities = rc.planned_activities;
                          r_activities = rc.reviewed_activities;
                          zero_rv_activities = rc.zero_reviewed_activities;
                          employeeId = rc.employee_id || rc.Emp;


                          if(pl_activities == r_activities)
                           {

                                  reviewStatusObject[employeeId] = 1;
                                  if(zero_rv_activities > 0)
                                  {

                                        reviewStatusObject[employeeId] = 0;
                                  }
                             
                            }


                              if(pl_activities == 0)
                              {

                                  reviewStatusObject[employeeId] = -1;


                              }

                              if(pl_activities > r_activities)
                              {

                                  reviewStatusObject[employeeId] = 0;

                              }

                              if(r_activities == 0)
                              {

                                  reviewStatusObject[employeeId] = -1;

                              }


                              

                          getEmployeeHierarchyMeetings(req,res,employeeId,filters,function(empMeetingHr){

                              // // console.log("employee heirarchy is -0------------------------->");
                               //// console.log(empMeetingHr);

                            // // console.log("Emp heirarchy for "+employeeId+" is -->"+JSON.stringify(empMeetingHr)+"  AND length is -->"+empMeetingHr.length);
                             if(empMeetingHr.length > 0){
                                 var teamPlannedActivities = empMeetingHr[0].team_planned_activities || 0;
                                 var teamReviewedActivities = empMeetingHr[0].team_reviewed_activities || 0;
                               }else{

                                   var teamPlannedActivities = 0;
                                   var teamReviewedActivities = 0;

                               }
                             var temp = {

                                   EmployeeId : employeeId,
                                   EmployeeName: empNameObject[employeeId],
                                   ReviewStatus: reviewStatusObject[employeeId],
                                   PlannedActivities : pl_activities,
                                   ReviewedActivities : r_activities,
                                   TeamPlannedActivities: teamPlannedActivities,
                                   TeamReviewedActivities: teamReviewedActivities,
                                   AccessLevel: objAccessLevel[employeeId],
                                   ReportingPerson: objReportingPerson[employeeId],
                                   //EmpHRObject : empMeetingHr || null,
                                   Initial_Create: null,
                                   Last_Updated : null



                              };

                               objectMeeting.push(temp);
                              
                             
                               callback();
                          });

          


                  });

                  

              },function(err) {
                if (err) return next(err);
                     
                    var resJson = {
                        success: true,
                        ErrorCode : 100,
                        message: 'completed sucessfully',
                        items: objectMeeting,
                        recordCount: objectMeeting.length,
                        ServerCurrentTime: new Date().getTime(),
                     
                      }; 

                    log.run(req,resJson,logFile);  
                    res.json(resJson);

                });  
            });

        }  


   });
  }else if(tm == 0)
  {

      whereClause(filters, currentUser,req,res, function(err, clause,q,limit,offset,al,status){

            if(err) 
            {
                response(res).failure(err);
            }


            if(status == false)
            {
               response(res).failure("Not Authorized !");
            }
            else
            {

                db.meeting.findAll(
                {

                    where: {employee_id : parseInt(filters.EmployeeId) , active:true,  $or: [{reviewStatus: 0}, {reviewStatus: 1}], schedule: { $gte : parseInt(filters.timestamp), $lt : parseInt(filters.totimestamp)} },
                    include: [{ model: db.lead , where: {active: true }, required : false, include: [ { model: db.product,where:{active: true},required:false },{model: db.product_lead_mapping,where: {active: 1},required:false},{ model: db.meeting, where: { meeting_type_id: 1 , $or: [{ reviewStatus: 0 } , { reviewStatus: 1 }] , active:true },required :false } ] },{ model: db.note, where:{active: true},required:false },{model: db.contact, where:{active: true},required:false},{model: db.agent,where: {active: true},required: false },{model: db.employee ,include: [ { model:db.access_level  }]}]

                }).then(function(meetings)
                {
                  
                    // console.log("ob length--->"+meetings.length);

                    //res.send(meetings);

                     
                    var obMeeting = [];
                    for(var i in meetings)
                    {

                        var meeting = meetings[i];
                        var meetingCount = 0;
                        var product_name = null;
                        var amount = null;
                        var purpose = null;
                        var duration = null;
                        var location = null;
                        var followup = null;
                        var note = null;
                        var contact_name = null;
                        var reviewStatus = null;
                        var isAgentMeeting = 0;
                      
                        if(meeting.lead && meeting.lead.meetings)
                        {
                            meetingCount = meeting.lead.meetings.length;
                            // if(meeting.lead.product){
                            //     product_name = meeting.lead.product.product_name || null;
                            // }

                            if(meeting.lead.product_lead_mappings){
                               
                               product_name = "";
                              meeting.lead.product_lead_mappings.map(function(pr,i){
                                  if(i == 0){

                                     product_name+=pr.product_name;
                                  }else{

                                    product_name+=", "+pr.product_name;
                                  }
                                  

                              });

                            }
                            
                            amount = meeting.lead.amount || null;
                           



                        }

                        var displayMeeting = false;
                        if(meeting.contact)
                        {
                            contact_name = meeting.contact.name || null;
                            isAgentMeeting = 0;
                            displayMeeting = true;
                        }else if(meeting.agent)
                        {
                              contact_name = meeting.agent.name || null;
                              isAgentMeeting = 1;
                              displayMeeting = true;
                        }

                        if(displayMeeting == false){

                            // console.log("meeting id --> "+meeting.meeting_id+" not displayed !");
                            continue;
                        }

                        

                       


                            purpose = meeting.purpose || null;
                            duration = meeting.q2 || null;
                            location = meeting.location || null;
                            followup = meeting.q3 || null;
                            note = meeting.note || null;
                            reviewStatus = meeting.reviewStatus || null;

                            var access_level = null;
                            var reporting_person = null;
                            var employeeName = null;

                         if(meeting.employee && meeting.employee.access_level)
                         {
                            access_level = meeting.employee.access_level.access_level;


                         } 
                         if(meeting.employee)
                         {
                             reporting_person = meeting.employee.reporting_person;
                             employeeName = meeting.employee.first_name || null;
                         }  

                        var tempOb = {

                           EmployeeId: meeting.employee_id,
                           EmployeeName: employeeName,
                           Client: contact_name,
                           Product: product_name,
                           Amount: amount,
                           MeetingCount : meetingCount,
                           Purpose : purpose,
                           Duration: duration,
                           Location: location,
                           FollowUp: followup,
                           ReviewStatus:reviewStatus,
                           IsAgentMeeting:isAgentMeeting,
                           Notes: note,
                           AccessLevel: access_level,
                           ReportingPerson: reporting_person,
                           Initial_Create: null,
                           Last_Updated: null

                           //lU: meeting.last_updated


                        };

                        obMeeting.push(tempOb);
                        



                    }


                setTimeout(function(){

                  var resJson = {
                            success: true,
                            ErrorCode : 100,
                            message: 'completed sucessfully',
                            items: obMeeting,
                            recordCount: obMeeting.length,
                            ServerCurrentTime: new Date().getTime(),
                           
                      };

                      log.run(req,resJson,logFile);

                   res.json(resJson);
               },1000);



                   
                    

                });
            }




      });



  }else
  {

       var error = {
                      "success": false,
                      "ErrorCode": 116,
                      "message": "fail",
                      "ServerCurrentTime": new Date().getTime(),
                      "error": "Invalid post values !"
             }

        log.run(req,error,logFile);     

      response(res).failure("Invalid post values !");

  }

     

};




var whereClause = function (filters, currentUser,req,res,callback) {
   var clause = [{  }];
     var empArray = [];
     var emp = null;
     var q = null;
     var limit = 5;
     var offset = 0;

    db.access_level.findOne({
        where : { employee_id : parseInt(filters.EmployeeId) },
        attributes : ['access_level'],
        group : ['access_level']

    }).then(function(al)
    {
        var team = parseInt(filters.Team);



         if(al && al.access_level == 2 &&  team == 1 )
         {
                 // condition 1
                  // console.log("current user id --->"+currentUser.EmployeeId);
                  // console.log("condition 1 is called ----------->");


                 reportingPerson.all(req,res,filters.EmployeeId,function(empObject){

                        empObject.map(function(e){

                            empArray.push(e.employee_id);
                       });


                        empArray.push(currentUser.EmployeeId);
                        empArray.push(filters.EmployeeId);


                         if(filters.timestamp)
                     {
            
                             q = { employee_id : { in: empArray } };
                
                          
                             callback(null, clause,q,limit,offset,al,true);

         
                      }else
                      {

                             q = { employee_id : { in: empArray }};
                            

                             callback(null, clause,q,limit,offset,al,true);
                      }

                 });


         }else if((al && al.access_level == 2 && team == 0) || ((al && al.access_level == 1)  && (team ==1 || team == 0)) ) 
         {
            // condition 2 


            

            if(filters.timestamp)
            {

                    q = { employee_id : parseInt(filters.EmployeeId)  };
                     
                    callback(null, clause,q,limit,offset,al,true);

            }else
            {
                q = { employee_id : parseInt(filters.EmployeeId) };
                     
                callback(null, clause,q,limit,offset,al,true);
               

            }

            
         }else
         {
            
             callback(null, clause,q,limit,offset,al,false);
          }
         
        
        
        

    });
};

var getEmployeeHierarchyMeetings = function(req,res,emp_id,filters,cl){
   var empA = [];

                  // console.log("Planned activities for employee------------------------------>"+emp_id);


                  reportingPerson.all(req,res,emp_id,function(empObject){

                        
                         empObject.map(function(e){

                            empA.push(e.employee_id);
                          });

                         empA.push(emp_id);

                         //res.send(empA);

                         var totalMeetingsObject = [];

                         if(empA.length > 0){

                          db.sequelize.query("select count('meeting_id') as team_planned_activities,( SELECT COUNT(*) FROM meeting WHERE (reviewStatus=0 or reviewStatus=1) AND employee_id IN("+empA+") AND schedule >= "+parseInt(filters.timestamp)+" AND schedule < "+parseInt(filters.totimestamp)+" AND active= 1) as team_reviewed_activities from meeting where employee_id IN("+empA+") AND schedule >= "+parseInt(filters.timestamp)+" AND schedule < "+parseInt(filters.totimestamp)+" AND active= 1",{ type: db.sequelize.QueryTypes.SELECT}).then(function(meetings){

                               
                               cl(meetings);

                          });
                        }else{
                           cl([]);
                        }


                  });

};