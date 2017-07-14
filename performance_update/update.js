var async = require('async');
var moment = require('moment');
var leadDropped = require('../performance_update/lead_dropped');



exports.run = function(db,db_pr)
{




  var currentTime = moment().format('x');
  var startOfDay = moment().startOf('day').format('x');
  var endOfDay = moment().endOf('day').format('x');
  var startOfWeek = moment().startOf('isoweek').format('x');
  var endOfWeek = moment().endOf('isoweek').format('x');
  var startOfMonth = moment().startOf('month').format('x');
  var endOfMonth = moment().endOf('month').format('x');
  var startOfYear = moment().startOf('year').format('x');
  var endOfYear = moment().endOf('year').format('x');
  var startOfQuarter= moment().startOf('quarter').format('x');
  var endOfQuarter= moment().endOf('quarter').format('x');
  var period = { day: ['day',startOfDay,endOfDay] , week: ['week',startOfWeek,endOfWeek] , month: ['month',startOfMonth,endOfMonth ], quarter: ['quarter',startOfQuarter,endOfQuarter],year: ['year',startOfYear,endOfYear] };



	var obLength = Object.keys(db).length;
	var allTables = ["lead"];
  var configTables = ["lead_stage_calculation","lead_stage_settings","leadsource"];
  var timestamp = new Date().getTime();
	var p_keys = { "acount" : "acount_id" ,"agent" : "agent_id","meeting" : "meeting_id","lead" : "lead_id" ,"lead_stage_calculation" : "stage_calculation_id","lead_stage_settings":"lead_stage_id","contact" : "contact_id" , "organization" : "organization_id","task" : "task_id","note" : "note_id","leadsource":"lead_source_id"  };

  // db.lead.findAll({
  //   include: [{ model: db.lead_stage_calculation,include: [{model: db.lead_stage_settings, where:{ position_level: 1}}]}],
  // }).then(function(lds){

  //        console.log(JSON.stringify(lds));
  // });



    async.forEachSeries(Object.keys(db),function(modelName, callback) {
           
          if(db[modelName] && allTables.indexOf(modelName) != -1){

            db[modelName].findAndCountAll({

                 where: { last_updated : { 	$lte: currentTime }  }

            }).then(function(records)
            {
                if(records.count > 0)
                {

                	     var tempJson = JSON.stringify(records.rows);
						 var tempObject = JSON.parse(tempJson);
						 //console.log(tempObject);

						 async.forEachSeries(tempObject,function(mObject, callback2){

						 	
						 	var key = p_keys[modelName];
						 	var whereObject = {  };
						 	whereObject[p_keys[modelName]] = mObject[key];

						 	db_pr[modelName].findOne({

						 		where: whereObject
						 	}).then(function(mO){

						 		if(mO)
						 		{
						 			 db_pr[modelName].update(mObject,{

                                     	where: whereObject
                                     }).then(function(up)
                                     {
                                     	console.log(key+ " "+mObject[key] +"  updated !!");
                                     	callback2();

                                     });



						 		}else{

                                    db_pr[modelName].create(mObject).then(function(cr)
                           	    	{
                           	    		console.log(key+ " "+mObject[key] +"  created !!");
                           	    		callback2();

                           	    	});

						 		}

						 		


						 	});



						 },function(err){
               if (err) return next(err);
                callback();
             });




                }else{

                   callback();
                }
            	

            });


           }else{
              callback();
           }
           
           // 

    }, function(err) {
        if (err) return next(err);
        // sync config tables
        async.forEachSeries(configTables,function(t_name, call_config) {

              if(db[t_name] && configTables.indexOf(t_name) != -1){

                db[t_name].findAndCountAll().then(function(rc){
                     if(rc.count > 0){
                          var tempJson = JSON.stringify(rc.rows);
                          var tempObject = JSON.parse(tempJson);

                          async.forEachSeries(tempObject,function(mObject, call_confi_2){

                               var key = p_keys[t_name];
                               var whereObject = {  };
                               whereObject[p_keys[t_name]] = mObject[key];

                               db_pr[t_name].findOne({
                                  where: whereObject
                               }).then(function(mO){

                                    if(mO)
                                    {
                                             db_pr[t_name].update(mObject,{

                                                    where: whereObject
                                              }).then(function(up)
                                              {
                                                 console.log(key+ " "+mObject[key] +"  updated !!");
                                                  call_confi_2();

                                              });



                                      }else{

                                              db_pr[t_name].create(mObject).then(function(cr)
                                              {
                                                  console.log(key+ " "+mObject[key] +"  created !!");
                                                  call_confi_2();

                                              });

                                     }

                               });

                          },function(err){
                              if (err) return next(err);
                               call_config();
                          });
                            

                     }else{

                      call_config();
                     }

                });

              }else{
                call_config();
              }

        },function(err){
             if (err) return next(err);
             console.log("all are done");

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
                         include: [{ model: db_pr.lead_stage_calculation,include: [{model: db_pr.lead_stage_settings, where:{ position_level: 1}}]}],

                    }).then(function(c){
                         console.log(table_name+ "  Records are  for "+empObject.employee_id+"  is "+c +"  for---"+pd[0]);
                         db.new_entries_record.create({ employee_id: empObject.employee_id , no_of_records: c ,type:pd[0],table_name: table_name,start_time:pd[1],end_time: pd[2],entry_on: currentTime }).then(function(up){
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
               // lead dropped code //
                leadDropped.run(db,db_pr,currentTime,allTables,period);


            });

        });

        });
       
       
         
    });



   
}




