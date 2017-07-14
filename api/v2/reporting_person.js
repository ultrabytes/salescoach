"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.reportingPerson = function(req, res){

    var currentTime = new Date().getTime();
    var filters = req.query;
    var rpObject = [];

    if(process.env.NODE_ENV == 'production') {
        var tomorrowDate = moment().add(1, 'days').startOf('day').utcOffset(0).format("x");

        var todayDateStart = moment().startOf('day').utcOffset(0).format('x');
        var todayDateEnd = moment().endOf('day').utcOffset(0).format('x');
    }
    else{

        var tomorrowDate = moment().add(1, 'days').startOf('day').format("x");

        var todayDateStart = moment().startOf('day').format('x');
        var todayDateEnd = moment().endOf('day').format('x');
    }


    req.tomorrowDate = tomorrowDate;
    req.todayDateStart = todayDateStart;
    req.todayDateEnd = todayDateEnd;


   // // console.log("Todays date is ---------------->"+todayDate);

    // console.log("Tomorrow date is -----------------------------------------------------------------------==================>"+tomorrowDate);

    getReportingPersons(req,res,function(employees){
      

      // console.log("reporting person count-->"+employees.length);

       if(employees.length > 0){



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
       }else{

            getEmployeeSelfData(req,res,function(recordObject){

              response(res).data(null);



            });
       }


    })

};


var getReportingPersons = function(req,res,call1){
  var empArray = [];

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
    var filters = req.query;
    var tempObject = null;
    db.meeting.count({
        where: { employee_id : emp.employee_id, active: true, $and: [{schedule: {$gte:filters.fromtimestamp }},{schedule: {$lt : req.tomorrowDate}}]}
    }).then(function(meetingCount){


      db.lead.count({

          where: { employee_id : emp.employee_id, active: true,$and: [{currentState:  {$ne: 7}  }, {currentState: {$ne:8} },{expectedClouserDate: { $gte:filters.fromtimestamp }},{expectedClouserDate: {$lt:req.tomorrowDate}}]   },
         // include: [{model: db.lead_stage_calculation,where:{active:1},include:[{ model:db.lead_stage_settings , where: { $and: [{position_level:  {$ne: 7}  }, {position_level: {$ne:8} }] }, required: true }]   }]

      }).then(function(leadCount){


         getEmployeeReportingPersonCount(req,res,emp,function(count){

            getEmployeeWithAccessLevel(req,res,emp,function(empO){


                var tempEmployee = empO.toModel();

                if(empO.access_level){


                   tempEmployee.AccessLevel = empO.access_level.toModel();
                }else{
                     tempEmployee.AccessLevel = null;
                }

                getReportingPersonActivityClosureCount(req,res,emp,function(a,c){

                       // console.log("Employee activity count is ----->"+meetingCount);
                       // console.log("Employee closure count is ----->"+leadCount);

                       // console.log("reporting person activities count is --->"+ a);
                       // console.log("reporting person closure count is --->"+ c);

                       getOverdueActivityCount(req,res,emp,function(oda,toda){

                           if(req.todayDateEnd < req.query.fromtimestamp  ){
                               oda = 0;
                               toda = 0;
                           }


                              tempObject = {

                             "Employee" : tempEmployee,
                             "Activities": meetingCount,
                             "Closures": leadCount,
                             "TeamActivities" : (meetingCount + a),
                             "TeamClosures" : (leadCount + c),
                             "OverdueActivityCount" : oda,
                             "TeamOverdueActivityCount" : (oda+toda),
                             "EmployeeCount": count
                            };


                             call2(tempObject);



                       });



                });


            });


         });


        
      }).catch(function(err){
          // console.log("ReportingPerson Error--> in Lead  count");
           response(res).failure(err);

      });

            
    }).catch(function(err){
        // console.log("ReportingPerson Error--> in meeting  count");
        response(res).failure(err);
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



var getEmployeeSelfData = function(req,res,call2){
     var filters = req.query;
     var tempObject = null;

     db.employee.findOne({
       where: { employee_id: filters.EmployeeId }
     }).then(function(emp){
           db.meeting.count({

               where: { employee_id : emp.employee_id, active: true,$and: [{schedule: {$gte:filters.fromtimestamp }},{schedule: {$lt : req.tomorrowDate}}]}
           }).then(function(meetingCount){

               db.lead.count({

                   where: { employee_id : emp.employee_id, active: true,$and: [{currentState:  {$ne: 7}  }, {currentState: {$ne:8} },{expectedClouserDate: { $gte:filters.fromtimestamp }},{expectedClouserDate: {$lt:req.tomorrowDate}}]   },
                   //include: [{model: db.lead_stage_calculation,where:{active:1},include:[{ model:db.lead_stage_settings , where: { $and: [{position_level:  {$ne: 7}  }, {position_level: {$ne:8} }] }, required: true }]   }]
               }).then(function(leadCount){
                       
                       getEmployeeWithAccessLevel(req,res,emp,function(empO){


                          var tempEmployee = empO.toModel();

                          if(empO.access_level){


                             tempEmployee.AccessLevel = empO.access_level.toModel();
                          }else{
                              tempEmployee.AccessLevel = null;
                          }




                          getOverdueActivityCount(req,res,emp,function(oda,toda){

                              if(req.todayDateEnd < req.query.fromtimestamp  ){
                                  oda = 0;
                                  toda = 0;
                              }


                             tempObject = {

                             "Employee" : tempEmployee,
                             "Activities": meetingCount,
                             "Closures": leadCount,
                             "TeamActivities": meetingCount,
                             "TeamClosures":leadCount,
                             "OverdueActivityCount":oda,
                             "TeamOverdueActivityCount":(oda+toda),
                             "EmployeeCount": 0
                            };


                            call2(tempObject);




                          });

                   });


               }).catch(function(err){
                    
                     // console.log("ReportingPerson Error--> in Lead  count");
                     response(res).failure(err);

               });
               

           }).catch(function(err){
                   

                   // console.log("ReportingPerson Error--> in meeting  count");
                   response(res).failure(err);

           });

     }).catch(function(err){
         
          // console.log("ReportingPerson Error--> in employee  read");
          response(res).failure(err);

     });

};

function extend(obj, src) {
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
}


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

var getReportingPersonActivityClosureCount = function(req,res,emp,call5){
   
   var filters = req.query;
   // db.employee.findAll({
   //      where: { reporting_person: emp.employee_id}
   // }).then(function(re){

    reportingPerson.all(req,res,emp.employee_id,function(re){

       var totalActivities = 0;
       var totalClosure = 0;
    
        async.forEachSeries(re,function(e,callback){

             db.meeting.count({

                where: { employee_id : e.employee_id, active: true,$and: [{schedule: {$gte:filters.fromtimestamp }},{schedule: {$lt : req.tomorrowDate}}]}
             }).then(function(ac){

                 // console.log("activities for "+e.employee_id+ " is -->"+ac);
                   
                 db.lead.count({

                     where: { employee_id : e.employee_id, active: true,$and: [{currentState:  {$ne: 7}  }, {currentState: {$ne:8} },{expectedClouserDate: { $gte:filters.fromtimestamp }},{expectedClouserDate: {$lt:req.tomorrowDate}}]   },
                     //include: [{model: db.lead_stage_calculation,where:{active:1},include:[{ model:db.lead_stage_settings , where: { $and: [{position_level:  {$ne: 7}  }, {position_level: {$ne:8} }] }, required: true }]   }]

                 }).then(function(cc){
                    
                         // console.log("closure for "+e.employee_id+ " is -->"+cc);
  
                       totalActivities+=ac;
                       totalClosure+=cc;

                       callback();


                 });  

             });

        },
         function(err){

             //res.send({totalActivities: totalActivities , totalClosure: totalClosure});
             call5(totalActivities,totalClosure);
         }
        );



                        
    });


      

   //});



};

var getOverdueActivityCount = function(req,res,emp,call6){

   var filters = req.query;

   db.meeting.count({
     where: { employee_id : emp.employee_id, active: true,schedule: { $lt : parseInt(filters.fromtimestamp)} , completedOn: null }
   }).then(function(oda){

       // console.log("OverdueActivityCount for employee "+emp.employee_id+" is "+oda);


     
        // db.employee.findAll({

        //       where: { reporting_person: emp.employee_id}
        // }).then(function(re){

          reportingPerson.all(req,res,emp.employee_id,function(re){


             var TeamOverdueActivityCount = 0;

              async.forEachSeries(re,function(e,callback){

                db.meeting.count({
                   
                   where: { employee_id : e.employee_id, active: true,schedule: { $lt : parseInt(filters.fromtimestamp)} , completedOn: null }

                }).then(function(ac){
                      
                        TeamOverdueActivityCount+=ac;
                        callback();

                });




              },function(err){

                  // console.log("all is done for overdue activity");
                  call6(oda,TeamOverdueActivityCount)

              });


          });


       // });

   });
  
};




