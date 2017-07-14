"use strict";
var async = require('async');

//var db_test = require('../../models_test');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function (req, res) {
    var metric_config = false;
    var filters = req.query;
    var currentUser = req.currentUser;
    var updatedTables = [];
    var tablesNameArray = ['access_level','account','lead_stage_settings','lead_doc_mapping','agent_stage_settings','product_settings','metric_category','metric_role_response','metric_account_response','role','leadsource','meetingtype','product','screen_module','target_selection_type','employee','agent','note','organization','contact','lead','lead_stage_calculation','task','meeting','agent_stage','agent_status','amc','product_industry_mapping','screen_base_display','screen_field','screen_picklist','target_selection_sub_type','target_type_mapping','team'];
    var withouttimestamp = ['account_setting'];
    var tablesdwdb = ['SP_AGGR_FACT'];

    var filters = req.query;
    // console.log("Timestamp is--->"+filters.timestamp);
    if(typeof filters.timestamp === 'undefined' || filters.timestamp == 'null')
    {
         // console.log("timestamp----------------->");
         tablesNameArray = withouttimestamp.concat(tablesNameArray);
      
    }
    // console.log(tablesNameArray);
    var currentUser = req.currentUser;
    whereClause(req,res,filters, currentUser, function (err, clause,sec_clause) {
        if (err) {
            response(res).failure(err);
        }
        else {
            callbackCounter(req,filters,clause,sec_clause, 1, res,currentUser,tablesNameArray,tablesdwdb,updatedTables,metric_config)
        }
    });

 
 
};

var callbackCounter = function (req,filters,clause,sec_clause, counter, res , currentUser,tablesNameArray,tablesdwdb,updatedTables,metric_config) {

   
    db[tablesNameArray[counter-1]].count({
        where: clause || {},
    }).then(function (count) {

          //// console.log("Count is --->"+count);
        if (count > 0) {

            if(tablesNameArray[counter-1] == 'metric_category'){
               // updatedTables.push('performance/metric-conf');
               

            }else if(tablesNameArray[counter-1] == 'lead_stage_settings')
            {
                 updatedTables.push('lead/lead_stage_setting');
            }else if(tablesNameArray[counter-1] == 'metric_role_response'){
                   metric_config = true;
                   //updatedTables.push('performance/metric-conf');
            }else if(tablesNameArray[counter-1] == 'agent_stage_settings'){

                  updatedTables.push('agent/agent-stage-setting');
            }else if(tablesNameArray[counter-1] == 'metric_account_response'){

                 metric_config = true;
            }else if(tablesNameArray[counter-1] == 'lead_stage_calculation'){
                        
                        updatedTables.push('lead');
            }
            else {
                updatedTables.push(tablesNameArray[counter-1]);
               
            }


            
        }

        /**** for contact log *********/

        if(tablesNameArray[counter-1] == 'contact' && count == 0)
        {
            // console.log("Contact -------------->");
            db.contact_log.count(
            {
                where: sec_clause || {}

            }).then(function(cl)
            {
                if(cl > 0)
                {
                     // console.log("Contact -------------->"+cl);
                     updatedTables.push('contact');
                }

            });
        }


        /******** for lead log ***********/

        if(tablesNameArray[counter-1] == 'lead' && count == 0)
        {
            // console.log("Contact -------------->");
            db.lead_log.count(
            {
                where: sec_clause || {}

            }).then(function(ll)
            {
                if(ll > 0)
                {
                     //// console.log("Contact -------------->"+cl);
                     updatedTables.push('lead');
                }

            });
        }


       


        
        if (counter == tablesNameArray.length) {
          
            db.access_level.findOne(
            {
                where : { employee_id : currentUser.EmployeeId  },
                attributes : ['access_level']

            }).then(function(al)
            {
                  if((al && al.access_level != 2) || !al)
                  {
                        var i = updatedTables.indexOf("employee");
                        if(i != -1) 
                        {
                            updatedTables.splice(i, 1);
                        }
    

                  }

                whereClauseReportDate(filters, currentUser, function (err, clause){
       
                    async.forEachSeries(tablesdwdb,function(table, callback){
                        if(filters.report_date){

                       db_dwdb[table].count({
                        where: clause || {},
                       }).then(function(c){

                            // console.log("count for table "+table+" is "+c);
                            if (c > 0) {
                                if(table == "SP_AGGR_FACT"){

                                   updatedTables.push("performance/target_consolidated");
                                }


                             }
                            callback();


                       });
                    }else{
                        callback();
                    }


                    },function(err){
                         if (err) return next(err);
                         // // console.log("All is done..");

                         //res.send();

                         whereClauseReportDate2(filters,currentUser,function(err, clause){
                         
                            if(filters.report_date){

                               db_dwdb.SP_SLS_PRDCT_AGGR_FACT.count({

                                  where: clause || {}
                               }).then(function(c){

                                       if (c > 0) {

                                             updatedTables.push("performance/sales-by-product");
                                       }

                                       if(metric_config == true){

                                          updatedTables.push('performance/metric-conf')
                                       }

                                       checkReportingPersonUpdate(req,res,updatedTables,function(ct){

                                          if(ct > 0){

                                              updatedTables.push('employee')

                                          }

                                           getUpdatedProductLeadMapping(req,res,filters, currentUser,function(ct,s){

                                               if(ct > 0){
                                                   updatedTables.push('product_lead_mapping');
                                               }



                                               whereClauseDWDB(req,res,filters, currentUser, function (err, clause,sec_clause) {

                                                   db_dwdb.DEAL_RISK_FACT.count({
                                                       where: clause || null
                                                   }).then(function(c){

                                                       if(c > 0){
                                                           updatedTables.push('DEAL_RISK_FACT');

                                                       }

                                                       var ar =  _.uniq(updatedTables);
                                                       response(res).page(ar);

                                                   });

                                               });


                                           });



                                       });

                                        
                               });



                            }else{

                                   if(metric_config == true){

                                          updatedTables.push('performance/metric-conf')
                                    }

                                    checkReportingPersonUpdate(req,res,updatedTables,function(ct){
                                        
                                          if(ct > 0){

                                              updatedTables.push('employee');

                                          }

                                        getUpdatedProductLeadMapping(req,res,filters, currentUser,function(ct,s){

                                            if(ct > 0){
                                                updatedTables.push('product_lead_mapping');
                                            }

                                            whereClauseDWDB(req,res,filters, currentUser, function (err, clause,sec_clause) {

                                                db_dwdb.DEAL_RISK_FACT.count({
                                                    where: clause || null
                                                }).then(function(c){

                                                    if(c > 0){
                                                        updatedTables.push('DEAL_RISK_FACT');

                                                    }

                                                    var ar =  _.uniq(updatedTables);
                                                    response(res).page(ar);

                                                });

                                            });



                                         });



                                    });



                            }
                                 

                         });


                       
                         


                    });
 

                 });

                    
                  

            });


           
        } else {
           
            counter++;
            callbackCounter(req,filters,clause,sec_clause, counter, res,currentUser,tablesNameArray,tablesdwdb,updatedTables,metric_config)
        }
    }).catch(function (err) {
        // console.log("error is ---->"+err);
        counter++;
        callbackCounter(req,filters,clause,sec_clause, counter, res,currentUser,tablesNameArray,tablesdwdb,updatedTables,metric_config);
    });


}
var whereClause = function (req,res,filters, currentUser, callback) {
    var accArray = [];

    var sec_clause = [{ old_employee_id : currentUser.EmployeeId }];

    db.access_level.findOne(
        {
            where : { employee_id : currentUser.EmployeeId },
            attributes : ['access_level'],
            group : ['access_level']

        }).then(function(al)
    {
        if(al && al.access_level == 2)
        {


            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    accArray.push(e.account_id);
                });


                accArray.push(currentUser.AccountId);

                // console.log("Account Array in Forst--->"+accArray);
                var clause = [{ account_id: {in: accArray } }];

                if (filters.timestamp && filters.timestamp != 'null') {
                    // console.log("Timestamp exitsts---------->");
                    clause.push({ 'last_updated': { $gt: filters.timestamp }});
                    sec_clause.push({ 'last_updated': { $gt: filters.timestamp }});


                }
                callback(null, clause,sec_clause);


            });





            //  });
        }else
        {

            accArray.push(currentUser.AccountId);
            // console.log("Account Array--->"+accArray);

            var clause = [{ account_id: {in: accArray } }];

            if (filters.timestamp && filters.timestamp != 'null') {
                // console.log("Timestamp exitsts---------->");
                clause.push({ 'last_updated': { $gt: filters.timestamp } });
                sec_clause.push({ 'last_updated': { $gt: filters.timestamp } });


            }
            callback(null, clause,sec_clause);

        }



    });


};


var whereClauseDWDB = function (req,res,filters, currentUser, callback) {
    var accArray = [];

    var sec_clause = [{ old_employee_id : currentUser.EmployeeId }];

    db.access_level.findOne(
        {
            where : { employee_id : currentUser.EmployeeId },
            attributes : ['access_level'],
            group : ['access_level']

        }).then(function(al)
    {
        if(al && al.access_level == 2)
        {


            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    accArray.push(e.account_id);
                });


                accArray.push(currentUser.AccountId);

                // console.log("Account Array in Forst--->"+accArray);
                var clause = [{ account_id: {in: accArray } }];

                if (filters.timestamp && filters.timestamp != 'null') {
                    // console.log("Timestamp exitsts---------->");
                    clause.push({ 'SOURCE_BACK_PULL_ID': { $gt: filters.timestamp }});
                    sec_clause.push({ 'SOURCE_BACK_PULL_ID': { $gt: filters.timestamp }});


                }
                callback(null, clause,sec_clause);


            });





            //  });
        }else
        {

            accArray.push(currentUser.AccountId);
            // console.log("Account Array--->"+accArray);

            var clause = [{ account_id: {in: accArray } }];

            if (filters.timestamp && filters.timestamp != 'null') {
                // console.log("Timestamp exitsts---------->");
                clause.push({ 'SOURCE_BACK_PULL_ID': { $gt: filters.timestamp } });
                sec_clause.push({ 'SOURCE_BACK_PULL_ID': { $gt: filters.timestamp } });


            }
            callback(null, clause,sec_clause);

        }



    });


};





var whereClauseReportDate = function (filters, currentUser, callback) {
    var accArray = [];
    var reportDate = null;
   
    //var sec_clause = [{ old_employee_id : currentUser.EmployeeId }];

    db.access_level.findOne(
    {
        where : { employee_id : currentUser.EmployeeId },
        attributes : ['access_level'],
        group : ['access_level']

    }).then(function(al)
    {
        if(al && al.access_level == 2)
        {
            db.employee.findAll(
            {
                where : {  reporting_person : currentUser.EmployeeId },
                attributes : ['account_id'],
                group: ['account_id']

            }).then(function(ac)
            {
                if(ac)
                {
                    ac.map(function(item)
                    {
                       accArray.push(item.account_id);

                    });

                }
                

                accArray.push(currentUser.AccountId);

                // console.log("Account Array in Forst--->"+accArray);
                var clause = [{ account_id: {in: accArray }}];

                if (filters.report_date && filters.report_date != 'null') {
                     
                    //reportDate = new Date(parseInt(filters.timestamp));

                     //res.send("report date is ---->"+reportDate);
                     //// console.log("converted time is --->"+reportDate);
                     var rd =  filters.report_date; 
                     //moment(filters.timestamp, "x").format("YYYY-MM-DD");
                      // console.log("converted time is --->"+rd);
                      
                    // console.log("Timestamp exitsts---------->");
                     clause.push({ Report_Dt: {$gt: rd}});
                    //sec_clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
                     

                }
                callback(null, clause);


            });
        }else
        {

             accArray.push(currentUser.AccountId);
             // console.log("Account Array--->"+accArray);

             var clause = [{ account_id: {in: accArray } }];

            if (filters.report_date && filters.report_date != 'null') {
                // console.log("Timestamp exitsts---------->");
             // var rd = convertTimeToDate(parseInt(filters.timestamp));
                var rd =  filters.report_date;
                //moment(filters.timestamp, "x").format("YYYY-MM-DD");

                   // console.log("converted time is --->"+rd);
                 clause.push({ Report_Dt: {$gt: rd}});
               // sec_clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
                 

            }
            callback(null, clause);

         }


        
    });


};



var whereClauseReportDate2 = function (filters, currentUser, callback) {
    var accArray = [];
    var reportDate = null;
   
    //var sec_clause = [{ old_employee_id : currentUser.EmployeeId }];

    db.access_level.findOne(
    {
        where : { employee_id : currentUser.EmployeeId },
        attributes : ['access_level'],
        group : ['access_level']

    }).then(function(al)
    {
        if(al && al.access_level == 2)
        {
            db.employee.findAll(
            {
                where : {  reporting_person : currentUser.EmployeeId },
                attributes : ['account_id'],
                group: ['account_id']

            }).then(function(ac)
            {
                if(ac)
                {
                    ac.map(function(item)
                    {
                       accArray.push(item.account_id);

                    });

                }


                accArray.push(currentUser.AccountId);

                // console.log("Account Array in Forst--->"+accArray);
                var clause = [{ account_id: {in: accArray }}];

                if (filters.report_date && filters.report_date != 'null') {

                    //reportDate = new Date(parseInt(filters.timestamp));

                     //res.send("report date is ---->"+reportDate);
                     //// console.log("converted time is --->"+reportDate);
                     var rd =  filters.report_date;
                     //moment(filters.timestamp, "x").format("YYYY-MM-DD");
                      // console.log("converted time is --->"+rd);

                    // console.log("Timestamp exitsts---------->");
                     clause.push({ Report_Dt: {$gt: rd}});
                    //sec_clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));


                }
                callback(null, clause);


            });
        }else
        {

             accArray.push(currentUser.AccountId);
             // console.log("Account Array--->"+accArray);

             var clause = [{ account_id: {in: accArray } }];

            if (filters.report_date && filters.report_date != 'null') {
                // console.log("Timestamp exitsts---------->");
             // var rd = convertTimeToDate(parseInt(filters.timestamp));
                var rd =  filters.report_date;
                //moment(filters.timestamp, "x").format("YYYY-MM-DD");

                   // console.log("converted time is --->"+rd);
                 clause.push({ Report_Dt: {$gt: rd}});
               // sec_clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));


            }
            callback(null, clause);

         }



    });


};

function convertTimeToDate(milliseconds){

    var d = new Date(milliseconds);
    var y = d.getFullYear();
    var m = d.getMonth();
    var date = d.getDate();
    var reportDate = ""+y+"-"+(m+1)+"-"+date;
    return reportDate;

}

var checkReportingPersonUpdate = function(req,res,updatedTables,cb){

    var empArray = [req.currentUser.EmployeeId];


    reportingPerson.all(req,res,req.currentUser.EmployeeId,function(empObject){
   

       empObject.map(function(e){

            empArray.push(e.employee_id);
        });

        db.employee.count({
            where: {last_updated: {$gt: req.query.timestamp }}

        }).then(function(c){

            cb(c);

        }).catch(function(err){

              // console.log("Error in checkReportingPersonUpdate");

            response(res).failure(err);

        });

    });

};





// product lead mapping where clause


var getUpdatedProductLeadMapping = function (req,res,filters, currentUser, cb) {
    var clause = [{  }];
    var empArray = [];
    var q = null;
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }
    var aboveManager = 0;


    //res.send(aboveManager);

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
            // console.log("condition 1 is called for product lead mapping ---------------------------------------->");


            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

               // return res.send(empObject);

                empObject.map(function(e){

                    empArray.push(e.account_id);
                });


                // console.log("Emp Array is--->"+empArray);



                    empArray.push(currentUser.AccountId);



                       // if(aboveManager == 1){
                            //// console.log("Data for above manager ------------------------>");
                            if(filters.timestamp && filters.timestamp != 'null')
                               q = {account_id: {in: empArray},last_updated : { $gt : filters.timestamp }};
                            else
                                q = {account_id: {in: empArray}};




                        db.product_lead_mapping.count({

                            where: q || null
                        }).then(function(c){

                             cb(c,true);
                        });



            }); // end reporting person callback






            // });
        }else if((al && al.access_level == 1) || aboveManager == 1)
        {
            // condition 2

            // console.log("condition 2 is called  for product lead mapping----------->");


                // condition 3
                // console.log("condition 3 is called ----------->");

                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");

                    if(filters.timestamp && filters.timestamp != 'null')
                        q = { account_id : currentUser.AccountId ,last_updated : { $gt : filters.timestamp }};
                    else
                        q = {account_id : currentUser.AccountId};


                    db.product_lead_mapping.count({

                        where: q || null
                    }).then(function(c){

                       cb(c,true);
                     });



        }else
        {
            // condition 5

            cb(0, false);
        }





    });
};

