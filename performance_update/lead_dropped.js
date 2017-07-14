var async = require('async');
var moment = require('moment');
var newReferralLead = require('../performance_update/new_referral_lead');
exports.run = function(db,db_pr,currentTime,allTables,period){

   db.employee.findAll().then(function(emp){
            
            async.forEachSeries(emp,function(empObject,call_1)
            {
     
               async.forEachSeries(allTables,function(table_name,call_2)
               {

                 async.forEachSeries(period,function(pd,call_3)
                 {
                      
                    db_pr[table_name].count(
                    {

                      where:{ last_updated : { $gte: pd[1], $lte: pd[2] } , employee_id: empObject.employee_id },
                      include: [{ model: db_pr.lead_stage_calculation,include: [{model: db_pr.lead_stage_settings, where:{ position_level: 8}}]}],
                      
                    }).then(function(c){
                         console.log(table_name+ "  Records are  for "+empObject.employee_id+"  is "+c +"  for---"+pd[0]);
                         db.lead_dropped.create({ employee_id: empObject.employee_id , no_of_records: c ,type:pd[0],table_name: table_name,start_time:pd[1],end_time: pd[2],entry_on: currentTime }).then(function(up){
                          call_3();
                         });
                         
                    });

                 },function(err){
                   if(err) return next(err); 
                    call_2();
                 });



               },function(err){
                    
                    if(err) return next(err); 
                    call_1();

               });

            },function(err){
               if(err) return next(err);
              
                console.log("Lead dropped executed !");
                newReferralLead.run(db,db_pr,currentTime,allTables,period);


            });

        });

};