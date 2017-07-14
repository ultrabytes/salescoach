"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var reportingPerson = require('../../helpers/reporting_heirarchy');
exports.all = function(req, res){

    var currentTime = new Date().getTime();
    var filters = req.query;
    var rpObject = [];

     getReportingPersons(req,res,function(employees){
        
   
          if(employees.length > 0)
          {
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

          }else
          {

            getEmployeeSelfData(req,res,function(recordObject){

              response(res).data(null);

            });

          }
        

     });
    



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
   //res.send(emp);
    var filters = req.query;
    var tempObject = null;
    db.lead.findAndCountAll({
      where: { employee_id : emp.employee_id, active: 1, $and: [{currentState:  {$ne: 7}  }, {currentState: {$ne:8} }] , initial_create:{$lt: filters.fromtimestamp } },
      //include: [{model: db.lead_stage_calculation,where:{active:1},include:[{ model:db.lead_stage_settings , where: { $and: [{position_level:  {$ne: 7}  }, {position_level: {$ne:8} }] }, required: true }]   }]
    }).then(function(lds){
         //res.send(lds);
          var ldAmount = 0;
          lds.rows.map(function(da){
                
                ldAmount+=da.amount;
          });

            
         getEmployeeReportingPersonCount(req,res,emp,function(count){



            getEmployeeWithAccessLevel(req,res,emp,function(empO){

               
                var tempEmployee = empO.toModel();

                if(empO.access_level){


                   tempEmployee.AccessLevel = empO.access_level.toModel();
                }else{
                     tempEmployee.AccessLevel = null;
                }

               

                getReportingPersonDealPipeline(req,res,emp,function(dc,c){

                             
                    
                              tempObject = {

                             "Employee" : tempEmployee,
                             "DealCount":lds.count,
                             "PipelineValue":ldAmount,
                             "TeamDealCount": dc +(lds.count),
                             "TeamPipelineValue": (c+ldAmount),
                             // "TeamActivities" : (meetingCount + a),
                             // "TeamClosures" : (leadCount + c),
                             // "OverdueActivityCount" : oda,
                             // "TeamOverdueActivityCount" : (oda+toda),
                              "EmployeeCount": count
                            };


                             call2(tempObject);



                });


            });



         });

         
    }).catch(function(err){
        
        response(res).failure(err);
    });


};


var getEmployeeSelfData = function(req,res,call2){

    var filters = req.query;
    var tempObject = null;

    db.employee.findOne({

      where: { employee_id: filters.EmployeeId },

    }).then(function(emp){
     
        db.lead.findAndCountAll({
            where: { employee_id : emp.employee_id, active: 1, $and: [{currentState:  {$ne: 7}  }, {currentState: {$ne:8} }] , initial_create:{$lt: filters.fromtimestamp } },
          //include: [{model: db.lead_stage_calculation,where:{active:1},include:[{ model:db.lead_stage_settings , where: { $and: [{position_level:  {$ne: 7}  }, {position_level: {$ne:8} }] }, required: true }]   }]
        }).then(function(lds){

            var ldAmount = 0;
            lds.rows.map(function(r){
               ldAmount+=r.amount;
            });

          getEmployeeWithAccessLevel(req,res,emp,function(empO){

                        var tempEmployee = empO.toModel();

                          if(empO.access_level){


                             tempEmployee.AccessLevel = empO.access_level.toModel();
                          }else{
                               tempEmployee.AccessLevel = null;
                          }

                          


                            tempObject = {

                             "Employee" : tempEmployee,
                             "DealCount":lds.count,
                             "PipelineValue":ldAmount,
                             "TeamDealCount": lds.count,
                             "TeamPipelineValue": ldAmount,
                             // "TeamActivities" : (meetingCount + a),
                             // "TeamClosures" : (leadCount + c),
                             // "OverdueActivityCount" : oda,
                             // "TeamOverdueActivityCount" : (oda+toda),
                             "EmployeeCount": 0
                            };


                             call2(tempObject);
                          



          });

        }).catch(function(err){
          response(res).failure(err);
        });


    }).catch(function(err){
        response(res).failure(err);
    });



};


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


var getReportingPersonDealPipeline = function(req,res,emp,call5){
   
  
   
   var filters = req.query;

    reportingPerson.all(req,res,emp.employee_id,function(re){


       var totalDealCount = 0;
       var totalPipelineValue = 0;
    
        async.forEachSeries(re,function(e,callback){

          

             db.lead.findAndCountAll({

                 where: { employee_id : e.employee_id, active: 1, $and: [{currentState:  {$ne: 7}  }, {currentState: {$ne:8} }] , initial_create:{$lt: filters.fromtimestamp } },
                 //include: [{model: db.lead_stage_calculation,where:{active:1},include:[{ model:db.lead_stage_settings, where:{ $and: [{position_level: {$ne: 7}},{position_level: {$ne:8}}] } }]   }]
             }).then(function(lds){

                      //res.send(lds);
                         
                       totalDealCount+=lds.count;
                       lds.rows.map(function(r){

                          totalPipelineValue+= r.amount;
                       });
                       
                       callback();
               

             }).catch(function(err){
                response(res).failure(err);
             });

        },
         function(err){
              //res.send("All done");
             //res.send({totalActivities: totalActivities , totalClosure: totalClosure});
             call5(totalDealCount,totalPipelineValue);
         }
        );



    });

       

  // });



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



