"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function(req,res) {
    var currentUser = req.currentUser;
    var filters = req.query;
    var employeeId = req.currentUser.EmployeeId;
    req.limit = parseInt(filters.limit) || 20;

    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {

        if (err) {
            //log.run(req,response(res).customError(err),logFile);
            response(res).failure(err);
        }
        if(status == false)
        {
            //log.run(req,response(res).customError("Not Authorized !"),logFile);
            return  response(res).failure("Not Authorized !");
        }

        if(filters.emp_id){

            employeeId = filters.emp_id;
        }


        // console.log("Query run for user----------->"+employeeId);

        db.metrics_definition.find({
            where: {metric_id: filters.metric_id}
        }).then(function (metric) {

            getEmployeeAccessLevel(req, res,employeeId, filters, function (al) {

                //return res.send({access_level: al.access_level});
                var n = metric.metric_name;
                //return res.send({meeting: n.replace(/ /g,'')});

                switch (n.replace(/ /g, '')) {

                    case "Wins":

                        // var querySelect = "select drv.emp_full_nm,  drv.emp_role_nm as emp_role, drv.mngr_full_nm as supervisor, 'Wins' as metric_nm, sp.TimeFrame as Report_Gen_on, drv.lead_name as Deal_Name,drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,drv.lead_product_name as Product_Name,count(drv.lead_product_name) as No_of_Units, sum(lead_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(drv.lead_won_dt) as Won_Date, max(lead_won_age) as Deal_Age_PipeLine from dwdb.EMP_LEADS_DTL_MSTR_DIM drv left join dwdb.SP_ROLUP_BRDGE_FACT sp on drv.employee_id = sp.employee_id and sp.Report_Dt = "+filters.report_date+" and metric_id="+filters.metric_id+" where drv.employee_id = "+currentUser.EmployeeId+" AND sp.TimeFrame="+filters.time_frame+" group by Report_Dt, emp_role_nm, mngr_full_nm, TimeFrame, lead_name, lead_contact_nm, lead_org_nm, lead_product_name  having max(drv.lead_won_dt) IS NOT NULL ORDER BY Won_Date asc LIMIT 20  OFFSET "+filters.offset+"";

                        queryForWins(req, res,employeeId, filters, function (qs, qc) {

                            // console.log("Qurey for wins running------------------>");
                            //return res.send({query: qs});


                            executeQueryForWins(req,res,filters,qc, qs, metric, al, function (resp) {

                                // console.log("Qurey for wins Response------------------>");

                                return res.send(resp);

                            });


                        });

                        break;


                    case "Losses":


                        queryForLosses(req, res,employeeId, filters, function (qs, qc) {

                            // console.log("Qurey for Losses running------------------>");


                            executeQueryForLosses(req,res,filters,qc, qs, metric, al, function (resp) {


                                // console.log("Query for losses Response------------------>");

                                return res.send(resp);

                            });


                        });

                        break;


                    case "MeetingsCallsCompleted":

                        queryForMeetingsCallsCompleted(req, res,employeeId, filters, function (qs, qc) {

                            // console.log("Qurey for MeetingsCallsCompleted running------------------>");


                            executeQueryForMeetingsCallsCompleted(req,res,filters,qc, qs, metric, al, function (resp) {


                                // console.log("Query forMeetingsCallsCompleted Response------------------>");

                                return res.send(resp);

                            });


                        });


                        break;

                    case "MeetingsAdded":

                        queryForMeetingsAdded(req, res,employeeId, filters, function (qs, qc) {

                            // console.log("Query for MeetingsAdded running------------------>");


                            executeQueryForMeetingsAdded(req,res,filters,qc, qs, metric, al, function (resp) {


                                // console.log("Query for MeetingsAdded Response------------------>");

                                return res.send(resp);

                            });


                        });


                        break;


                    case "NewLeadsAdded":

                        queryForNewLeadAdded(req, res, employeeId,filters, function (qs, qc) {

                            // console.log("Qurey for MeetingAdded running------------------>");


                            executeQueryForNewLeadAdded(req,res,filters,qc, qs, metric, al, function (resp) {


                                // console.log("Query for MeetingAdded Response------------------>");

                                return res.send(resp);

                            });


                        });


                        break;


                    case "ReferralsGenerated":

                        queryForReferralsGenerated(req, res,employeeId, filters, function (qs, qc) {


                            executeQueryForReferralGenerated(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;

                    case "PipelinebyProduct":

                        queryForPipeline(req, res,employeeId, filters, function (qs, qc) {


                            executeQueryForPipeline(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;


                    case "LeadsDropped":

                        queryForLeadsDropped(req, res, employeeId,filters, function (qs, qc) {


                            executeQueryLeadsDropped(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;

                    case "AgentMeetingsandCallsCompleted":


                        queryAgentMeetingsandCallsCompleted(req, res, employeeId,filters, function (qs, qc) {


                            executeQueryAgentMeetingsandCallsCompleted(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;

                        case "AgentsRecruited":


                        queryAgentsRecruited(req, res, employeeId,filters, function (qs, qc) {


                            executeQueryAgentsRecruited(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;

                        case "AgentsRejected":


                        queryAgentsRejected(req, res, employeeId,filters, function (qs, qc) {


                            executeQueryAgentsRejected(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;


                        case "NewAgentleadsAdded":


                        queryNewAgentleadsAdded(req, res, employeeId,filters, function (qs, qc) {


                            executeQueryNewAgentleadsAdded(req,res,filters,qc, qs, metric, al, function (resp) {


                                return res.send(resp);

                            });


                        });


                        break;




                    default:

                        var resJson = {
                            success: false,
                            ErrorCode: 116,
                            message: 'No data found for this request.',
                            ServerCurrentTime: new Date().getTime(),

                        };

                        return res.send(resJson);

                }


            });


        }).catch(function (err) {
            response(res).failure(err);
        }); //end metric then



    });



};


    var  queryForWins = function(req,res,employeeId,filters,callback){

            reportingPerson.all(req,res,employeeId,function(empObject){


                    var querySelect = "select";
                    querySelect+="  drv.emp_full_nm as Deal_Owner, drv.lead_id,drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name, ";
                    querySelect+="  GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name, count(drv.lead_product_name) as No_of_Units,";
                    querySelect+="  sum(lead_product_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Won_Date, max(lead_won_age) as Deal_Age_PipeLine";
                    querySelect+="  from";
                    querySelect+="  dwdb.EMP_HIER_DIM emp_hier";
                    querySelect+="  inner join";
                    querySelect+="  dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                    querySelect+="  on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                    querySelect+="  inner join";
                    querySelect+="  dwdb.EMP_TF_STRT_END_DIM tf";
                    querySelect+="  on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
                    querySelect+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
                    querySelect+="  and tf.TimeFrame = "+filters.time_frame+"";
                    querySelect+="  and lead_stage_position_lvl = 7 ";
                    querySelect+="  and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
                    querySelect+="  group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm";
                    querySelect+="  order by Won_Date asc  LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";




                    var queryCount = "select";
                    queryCount+="  drv.emp_full_nm as Deal_Owner, drv.lead_id,drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name, ";
                    queryCount+="  GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name, count(drv.lead_product_name) as No_of_Units,";
                    queryCount+="  sum(lead_product_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Won_Date, max(lead_won_age) as Deal_Age_PipeLine";
                    queryCount+="  from";
                    queryCount+="  dwdb.EMP_HIER_DIM emp_hier";
                    queryCount+="  inner join";
                    queryCount+="  dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                    queryCount+="  on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                    queryCount+="  inner join";
                    queryCount+="  dwdb.EMP_TF_STRT_END_DIM tf";
                    queryCount+="  on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
                    queryCount+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
                    queryCount+="  and tf.TimeFrame = "+filters.time_frame+"";
                    queryCount+="  and lead_stage_position_lvl = 7 ";
                    queryCount+="  and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
                    queryCount+="  group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm";
                    queryCount+="  order by Won_Date asc";



                // }



                callback(querySelect,queryCount);


            });

    };



    var executeQueryForWins =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){


                var temp = {};

                temp.Text1 =  o.Deal_Name;
                temp.Text2 =  o.Amount+", "+o.Contact_Name; //+", Assigned To: "+o.emp_full_nm || null;
                temp.LeadId = o.lead_id || null;
                temp.EmpFullName = o.emp_full_nm || null;
                temp.DealOwner = o.Deal_Owner || null;
                temp.DealName = o.Deal_Name;
                temp.Amount = o.Amount;
                temp.ContactName = o.Contact_Name;
                temp.EmpRole = o.emp_role || null;
                temp.Supervisor = o.supervisor || null;
                temp.MetricNm = o.metric_nm || null;
                temp.ReportGenOn = o.Report_Gen_on;
                temp.OrganizationName = o.Organization_Name;
                temp.ProductName = o.product_name;
                temp.NoofUnits = o.No_of_Units;
                temp.LeadGenerationDate = o.Lead_Generation_Date;
                temp.WonDate = o.Won_Date;
                temp.DealAgePipeLine = o.Deal_Age_PipeLine;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


var queryAgentMeetingsandCallsCompleted = function(req,res,employeeId,filters,callback){

    reportingPerson.all(req,res,employeeId,function(empObject){

        var querySelect = "select";
        querySelect+="  meet.emp_full_nm as Activity_Owner, meet.agent_id, meet.meeting_id, meet.meeting_contact_nm as agent_contact_name,  meet.meeting_purpose as Purpose, ";
        querySelect+="  meet.meeting_type as Activity_Type,";
        querySelect+="  max(meet.Meeting_completd_dt) as Meeting_Complete_Date";
        querySelect+="  from";
        querySelect+="  dwdb.AGENT_CALLS_DIM meet";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_HIER_DIM emp_hier";
        querySelect+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_TF_STRT_END_DIM tf";
        querySelect+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id ";
        querySelect+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
        querySelect+="  and tf.TimeFrame = "+filters.time_frame+"";
        querySelect+="  and date(meet.Meeting_completd_dt) between tf.Start_Date and tf.End_Date ";
        querySelect+="  group by 1,2,3,4,5,6 ";
        querySelect+="  order by meet.Meeting_completd_dt asc  LIMIT  "+ req.limit +"  OFFSET "+filters.offset+"";





        var queryCount = "select";
        queryCount+="  meet.emp_full_nm as Activity_Owner, meet.agent_id, meet.meeting_id, meet.meeting_contact_nm as agent_contact_name,  meet.meeting_purpose as Purpose, ";
        queryCount+="  meet.meeting_type as Activity_Type,";
        queryCount+="  max(meet.Meeting_completd_dt) as Meeting_Complete_Date";
        queryCount+="  from";
        queryCount+="  dwdb.AGENT_CALLS_DIM meet";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_HIER_DIM emp_hier";
        queryCount+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_TF_STRT_END_DIM tf";
        queryCount+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id ";
        queryCount+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
        queryCount+="  and tf.TimeFrame ="+filters.time_frame+"";
        queryCount+="  and date(meet.Meeting_completd_dt) between tf.Start_Date and tf.End_Date ";
        queryCount+="  group by 1,2,3,4,5,6 ";
        queryCount+="  order by meet.Meeting_completd_dt asc";

        callback(querySelect,queryCount);


    });



};

var executeQueryAgentMeetingsandCallsCompleted = function(req,res,filters,queryCount,querySelect,metric,al,cb){



    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){

                var json = {"md": o.Meeting_Complete_Date};
                //return res.send(json);
                var ds = JSON.stringify(json);

                var dO = JSON.parse(ds);

                if(process.env.NODE_ENV == 'production')
                    var meeting_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").utcOffset(0).format("ddd,DD MMM-hh:mm a");
                else
                    var meeting_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").format("ddd,DD MMM-hh:mm a");


                var temp = {};

                temp.Text1 =  toTitleCase(o.Activity_Type)+ " with "+ o.agent_contact_name;
                temp.Text2 =  meeting_date + " ,Assigned to: " + o.Activity_Owner;
                temp.ActivityOwner = o.Activity_Owner || null;
                temp.AgentId = o.agent_id || null;
                temp.AgentContactName = o.agent_contact_name || null;
                temp.Purpose = o.Purpose;
                temp.ActivityType = o.Activity_Type;
                temp.MeetingCompleteDate = meeting_date || null;




                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


var queryNewAgentleadsAdded = function(req,res,employeeId,filters,callback){

    reportingPerson.all(req,res,employeeId,function(empObject){




        var querySelect = "select";
        querySelect+="  meet.emp_full_nm as Deal_Owner, meet.agent_id, meet.agent_nm as Agent_Name, ";
        querySelect+="  max(meet.agent_stage_name) as Recruitment_Stage,";
        querySelect+="  max(meet.agent_prospect_date) as Agent_Generation_Date, ";
        querySelect+="  max(meet.agent_expectd_Closure_Date) as Expected_Close_Date ";
        querySelect+="  from";
        querySelect+="  dwdb.AGENT_CALLS_DIM meet";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_HIER_DIM emp_hier";
        querySelect+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_TF_STRT_END_DIM tf";
        querySelect+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id";
        querySelect+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
        querySelect+="  and tf.TimeFrame = "+filters.time_frame+"";
        querySelect+="  and date(meet.agent_create_date) between tf.Start_Date and tf.End_Date";
        querySelect+="  group by 1,2,3";
        querySelect+="  order by meet.agent_create_date asc LIMIT  "+ req.limit +"  OFFSET "+filters.offset+"";





        var queryCount = "select";
        queryCount+="  meet.emp_full_nm as Deal_Owner, meet.agent_id, meet.agent_nm as Agent_Name, ";
        queryCount+="  max(meet.agent_stage_name) as Recruitment_Stage,";
        queryCount+="  max(meet.agent_prospect_date) as Agent_Generation_Date, ";
        queryCount+="  max(meet.agent_expectd_Closure_Date) as Expected_Close_Date ";
        queryCount+="  from";
        queryCount+="  dwdb.AGENT_CALLS_DIM meet";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_HIER_DIM emp_hier";
        queryCount+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_TF_STRT_END_DIM tf";
        queryCount+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id";
        queryCount+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
        queryCount+="  and tf.TimeFrame = "+filters.time_frame+"";
        queryCount+="  and date(meet.agent_create_date) between tf.Start_Date and tf.End_Date";
        queryCount+="  group by 1,2,3";
        queryCount+="  order by meet.agent_create_date asc";



        callback(querySelect,queryCount);


    });



};


var executeQueryNewAgentleadsAdded = function(req,res,filters,queryCount,querySelect,metric,al,cb){



    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){

                var json = {"md": o.Expected_Close_Date};
                //return res.send(json);
                var ds = JSON.stringify(json);

                var dO = JSON.parse(ds);

                if(process.env.NODE_ENV == 'production')
                    var Expected_Close_Date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").utcOffset(0).format("ddd,DD MMM-hh:mm a");
                else
                    var Expected_Close_Date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").format("ddd,DD MMM-hh:mm a");





                var temp = {};

                temp.Text1 =  o.Agent_Name || null;
                temp.Text2 =  "Assigned To: "+o.Deal_Owner;
                temp.DealOwner = o.Deal_Owner || null;
                temp.AgentId = o.agent_id || null;
                temp.AgentName = o.Agent_Name || null;
                temp.AgentGenerationDate = o.Agent_Generation_Date;
                temp.RecruitmentStage = o.Recruitment_Stage;
                temp.ExpectedCloseDate = Expected_Close_Date || null;




                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};



var queryAgentsRejected = function(req,res,employeeId,filters,callback){

    reportingPerson.all(req,res,employeeId,function(empObject){




        var querySelect = "select";
        querySelect+="  meet.emp_full_nm as Deal_Owner, meet.agent_id, meet.agent_nm as Agent_Name, max(meet.agent_prospect_date) as Agent_Generation_Date, ";
        querySelect+="  max(cast(meet.agent_stage_start_date as date)) as Agent_Rejection_Date, max(meet.agent_stage_name) as Recruitment_Stage,";
        querySelect+="  max(meet.agent_lost_reason) as Loss_Reason, ";
        querySelect+="  max(meet.agent_lost_age) as Deal_Age_PipeLine";
        querySelect+="  from";
        querySelect+="  dwdb.AGENT_CALLS_DIM meet";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_HIER_DIM emp_hier";
        querySelect+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_TF_STRT_END_DIM tf";
        querySelect+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id ";
        querySelect+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
        querySelect+="  and tf.TimeFrame = "+filters.time_frame+"";
        querySelect+="  and meet.agnt_stage_position_lvl = 10";
        querySelect+="  and date(meet.agent_stage_start_date) between tf.Start_Date and tf.End_Date";
        querySelect+="  group by 1,2,3";
        querySelect+="  order by meet.agent_stage_start_date asc  LIMIT  "+ req.limit +"  OFFSET "+filters.offset+"";





        var queryCount = "select";
        queryCount+="  meet.emp_full_nm as Deal_Owner, meet.agent_id, meet.agent_nm as Agent_Name, max(meet.agent_prospect_date) as Agent_Generation_Date, ";
        queryCount+="  max(cast(meet.agent_stage_start_date as date)) as Agent_Rejection_Date, max(meet.agent_stage_name) as Recruitment_Stage,";
        queryCount+="  max(meet.agent_lost_reason) as Loss_Reason, ";
        queryCount+="  max(meet.agent_lost_age) as Deal_Age_PipeLine";
        queryCount+="  from";
        queryCount+="  dwdb.AGENT_CALLS_DIM meet";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_HIER_DIM emp_hier";
        queryCount+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_TF_STRT_END_DIM tf";
        queryCount+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id ";
        queryCount+="  where emp_hier.mngr_emp_id =" + employeeId + " ";
        queryCount+="  and tf.TimeFrame = "+filters.time_frame+"";
        queryCount+="  and meet.agnt_stage_position_lvl = 10";
        queryCount+="  and date(meet.agent_stage_start_date) between tf.Start_Date and tf.End_Date";
        queryCount+="  group by 1,2,3";
        queryCount+="  order by meet.agent_stage_start_date asc";







        callback(querySelect,queryCount);


    });



};


var executeQueryAgentsRejected = function(req,res,filters,queryCount,querySelect,metric,al,cb){



    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){

                var json = {"md": o.Agent_Rejection_Date};
                //return res.send(json);
                var ds = JSON.stringify(json);

                var dO = JSON.parse(ds);

                if(process.env.NODE_ENV == 'production')
                    var Agent_Rejection_Date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").utcOffset(0).format("ddd,DD MMM-hh:mm a");
                else
                    var Agent_Rejection_Date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").format("ddd,DD MMM-hh:mm a");





                var temp = {};

                temp.Text1 =  o.Agent_Name || null;
                temp.Text2 =  "Assigned to: "+o.Deal_Owner+", Rejected on: "+Agent_Rejection_Date;
                temp.DealOwner = o.Deal_Owner || null;
                temp.AgentId = o.agent_id || null;
                temp.AgentName = o.Agent_Name || null;
                temp.AgentGenerationDate = o.Agent_Generation_Date;
                temp.AgentRejectionDate = Agent_Rejection_Date;
                temp.RecruitmentStage = o.Recruitment_Stage;
                temp.LossReason = o.Loss_Reason;
                temp.ActivityType = o.Activity_Type;
                temp.DealAgePipeLine = o.Deal_Age_PipeLine || null;




                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


var queryAgentsRecruited = function(req,res,employeeId,filters,callback){

    reportingPerson.all(req,res,employeeId,function(empObject){




        var querySelect = "select";
        querySelect+="  meet.emp_full_nm as Deal_Owner, meet.agent_id, meet.agent_nm as Agent_Name, max(meet.agent_prospect_date) as Agent_Generation_Date,";
        querySelect+="  max(cast(meet.agent_stage_start_date as date)) as Won_Date, max(meet.num_days_in_pipeline) as Deal_Age_PipeLine ";
        querySelect+="  from";
        querySelect+="  dwdb.AGENT_CALLS_DIM meet";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_HIER_DIM emp_hier";
        querySelect+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        querySelect+="  inner join";
        querySelect+="  dwdb.EMP_TF_STRT_END_DIM tf";
        querySelect+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id ";
        querySelect+="  where emp_hier.mngr_emp_id=" + employeeId + " ";
        querySelect+="  and tf.TimeFrame = "+filters.time_frame+"";
        querySelect+="  and meet.agnt_stage_position_lvl = 9 ";
        querySelect+="  and date(meet.agent_stage_start_date) between tf.Start_Date and tf.End_Date";
        querySelect+="  group by 1,2,3";
        querySelect+="  order by meet.agent_stage_start_date asc  LIMIT  "+ req.limit +"  OFFSET "+filters.offset+"";





        var queryCount = "select";
        queryCount+="  meet.emp_full_nm as Deal_Owner, meet.agent_id, meet.agent_nm as Agent_Name, max(meet.agent_prospect_date) as Agent_Generation_Date,";
        queryCount+="  max(cast(meet.agent_stage_start_date as date)) as Won_Date, max(meet.num_days_in_pipeline) as Deal_Age_PipeLine ";
        queryCount+="  from";
        queryCount+="  dwdb.AGENT_CALLS_DIM meet";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_HIER_DIM emp_hier";
        queryCount+="  on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
        queryCount+="  inner join";
        queryCount+="  dwdb.EMP_TF_STRT_END_DIM tf";
        queryCount+="  on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id ";
        queryCount+="  where emp_hier.mngr_emp_id=" + employeeId + " ";
        queryCount+="  and tf.TimeFrame="+filters.time_frame+"";
        queryCount+="  and meet.agnt_stage_position_lvl = 9 ";
        queryCount+="  and date(meet.agent_stage_start_date) between tf.Start_Date and tf.End_Date";
        queryCount+="  group by 1,2,3";
        queryCount+="  order by meet.agent_stage_start_date asc";


        callback(querySelect,queryCount);


    });



};

var executeQueryAgentsRecruited = function(req,res,filters,queryCount,querySelect,metric,al,cb){



    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){

                var json = {"md": o.Won_Date};
                //return res.send(json);
                var ds = JSON.stringify(json);

                var dO = JSON.parse(ds);

                if(process.env.NODE_ENV == 'production')
                    var won_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").utcOffset(0).format("ddd,DD MMM-hh:mm a");
                else
                    var won_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").format("ddd,DD MMM-hh:mm a");


                var temp = {};

                temp.Text1 =  o.Agent_Name || null;
                temp.Text2 =  "Assigned to : "+o.Deal_Owner;
                temp.DealOwner = o.Deal_Owner || null;
                temp.AgentId = o.agent_id || null;
                temp.AgentName = o.Agent_Name || null;
                temp.AgentGenerationDate = o.Agent_Generation_Date;
                temp.ActivityType = o.Activity_Type;
                temp.WonDate = won_date || null;
                temp.DealAgePipeLine = o.Deal_Age_PipeLine || null;




                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};





    var queryForLosses = function(req,res,employeeId,filters,callback){

       reportingPerson.all(req,res,employeeId,function(empObject){

           // if(empObject.length == 0) {
           //     var querySelect = "select";
           //     querySelect += "   drv.lead_id,drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name, drv.lead_product_name as product_name,count(drv.lead_product_name) as No_of_Units,";
           //     querySelect += "  sum(lead_product_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Lead_Lost_Date,";
           //     querySelect += "  max(drv.lead_lost_reason) as Loss_Reason,";
           //     querySelect += "  max(lead_lost_age) as Deal_Age_PipeLine";
           //     querySelect += "  from";
           //     querySelect += "  dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
           //     querySelect += "  inner join";
           //     querySelect += "  dwdb.EMP_TF_STRT_END_DIM tf";
           //     querySelect += "  on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id";
           //     querySelect += "  where drv.employee_id =" + employeeId + " ";
           //     querySelect += "  and tf.TimeFrame = " + filters.time_frame + " ";
           //     querySelect += "  and lead_stage_position_lvl = 8";
           //     querySelect += "  and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
           //     querySelect += "  group by  drv.lead_id,lead_name, lead_contact_nm, lead_org_nm, drv.lead_product_name ";
           //     querySelect += "  order by Lead_Lost_Date asc  LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";
           //
           //
           //     var queryCount = "select";
           //     queryCount += "   drv.lead_id,drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,drv.lead_product_name as product_name, count(drv.lead_product_name) as No_of_Units,";
           //     queryCount += "  sum(lead_product_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Lead_Lost_Date,";
           //     queryCount += "  max(drv.lead_lost_reason) as Loss_Reason,";
           //     queryCount += "  max(lead_lost_age) as Deal_Age_PipeLine";
           //     queryCount += "  from";
           //     queryCount += "  dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
           //     queryCount += "  inner join";
           //     queryCount += "  dwdb.EMP_TF_STRT_END_DIM tf";
           //     queryCount += "  on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id";
           //     queryCount += "  where drv.employee_id =" + employeeId + " ";
           //     queryCount += "  and tf.TimeFrame = " + filters.time_frame + " ";
           //     queryCount += "  and lead_stage_position_lvl = 8";
           //     queryCount += "  and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
           //     queryCount += "  group by  drv.lead_id,lead_name, lead_contact_nm, lead_org_nm, drv.lead_product_name ";
           //     queryCount += "  order by Lead_Lost_Date asc";
           // }else{

                // console.log("REport query runs ------------------------------------------->");
               var querySelect = "select";
               querySelect += " drv.emp_full_nm as Deal_Owner, drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,";
               querySelect += " GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,count(drv.lead_product_name) as No_of_Units,";
               querySelect += " sum(lead_product_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Lead_Lost_Date,";
               querySelect += " max(cast(drv.lead_lost_reason as date)) as Loss_Reason,";
               querySelect += " max(lead_lost_age) as Deal_Age_PipeLine";
               querySelect += " from";
               querySelect += " dwdb.EMP_HIER_DIM emp_hier";
               querySelect += " inner join";
               querySelect += " dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
               querySelect += " on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
               querySelect += " inner join";
               querySelect += " dwdb.EMP_TF_STRT_END_DIM tf";
               querySelect += " on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
               querySelect += " where emp_hier.mngr_emp_id = "+employeeId+" ";
               querySelect += " and tf.TimeFrame = " + filters.time_frame + " ";
               querySelect += " and lead_stage_position_lvl = 8";
               querySelect += " and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
               querySelect += " group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm";
               querySelect += " order by Lead_Lost_Date asc  LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";


           var queryCount = "select";
           queryCount += " drv.emp_full_nm as Deal_Owner, drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,";
           queryCount += " GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,count(drv.lead_product_name) as No_of_Units,";
           queryCount += " sum(lead_product_amount) Amount, max(drv.lead_prospect_Dt) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Lead_Lost_Date,";
           queryCount += " max(cast(drv.lead_lost_reason as date)) as Loss_Reason,";
           queryCount += " max(lead_lost_age) as Deal_Age_PipeLine";
           queryCount += " from";
           queryCount += " dwdb.EMP_HIER_DIM emp_hier";
           queryCount += " inner join";
           queryCount += " dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
           queryCount += " on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
           queryCount += " inner join";
           queryCount += " dwdb.EMP_TF_STRT_END_DIM tf";
           queryCount += " on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
           queryCount += " where emp_hier.mngr_emp_id = "+employeeId+" ";
           queryCount += " and tf.TimeFrame = " + filters.time_frame + " ";
           queryCount += " and lead_stage_position_lvl = 8";
           queryCount += " and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
           queryCount += " group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm";
           queryCount += " order by Lead_Lost_Date asc";


               //res.send(querySelect);


           //}

           callback(querySelect,queryCount);

       });



   };

    var executeQueryForLosses =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){


                var temp = {};

                temp.Text1 =  o.Deal_Name;
                temp.Text2 =  o.Amount+", "+o.Contact_Name || null;//+", Assigned To: "+o.emp_full_nm;
                temp.LeadId = o.lead_id || null;
                temp.EmpFullName = o.emp_full_nm || null;
                temp.DealName = o.Deal_Name || null;
                temp.DealOwner = o.Deal_Owner || null
                temp.Amount = o.Amount || null;
                temp.ContactName = o.Contact_Name || null;
                temp.EmpRole = o.emp_role || null;
                temp.Supervisor = o.supervisor || null;
                temp.MetricNm = o.metric_nm || null;
                temp.ReportGenOn = o.Report_Gen_on || null;
                temp.OrganizationName = o.Organization_Name || null;
                temp.ProductName = o.product_name || null;
                temp.NoofUnits = o.No_of_Units || null;
                temp.LeadGenerationDate = o.Lead_Generation_Date || null;
                temp.LossReason = o.Loss_Reason || null;
                temp.LeadLostDate = o.Lead_Lost_Date || null;
                temp.DealAgePipeLine = o.Deal_Age_PipeLine || null;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


    var  queryForMeetingsCallsCompleted = function(req,res,employeeId,filters,callback){

        reportingPerson.all(req,res,employeeId,function(empObject){


                var querySelect = "select";
                querySelect+=" meet.emp_full_nm as Deal_Owner, meet.meeting_contact_nm as Contact_name, meet.org_name as Organization_name, GROUP_CONCAT(drv.lead_product_name separator ', ') as Product,";
                querySelect+=" meet.meeting_purpose as Purpose, meet.meeting_type as Activity_Type, meet.emp_full_nm as Activity_Owner, meet.Meeting_completd_dt as Meeting_Complete_Date";
                querySelect+=" from";
                querySelect+=" dwdb.EMP_LEAD_CALL_DIM meet";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_HIER_DIM emp_hier";
                querySelect+=" on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
                querySelect+=" on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id";
                querySelect+=" left join";
                querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                querySelect+=" on meet.meeting_lead_id = drv.lead_id";
                querySelect+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                querySelect+=" and tf.TimeFrame =" +filters.time_frame + " ";
                querySelect+=" and date(meet.Meeting_completd_dt) between tf.Start_Date and tf.End_Date and meet.agent_id is null";
                querySelect+=" group by 1,2,3,5,6,7,8";
                querySelect+=" order by meet.Meeting_completd_dt asc LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";





            var queryCount = "select";
            queryCount+=" meet.emp_full_nm as Deal_Owner, meet.meeting_contact_nm as Contact_name, meet.org_name as Organization_name, GROUP_CONCAT(drv.lead_product_name separator ', ') as Product,";
            queryCount+=" meet.meeting_purpose as Purpose, meet.meeting_type as Activity_Type, meet.emp_full_nm as Activity_Owner, meet.Meeting_completd_dt as Meeting_Complete_Date";
            queryCount+=" from";
            queryCount+=" dwdb.EMP_HIER_DIM emp_hier";
            queryCount+=" inner join";
            queryCount+=" dwdb.EMP_LEAD_CALL_DIM meet";
            queryCount+=" on meet.account_id = emp_hier.account_id and meet.employee_id = emp_hier.employee_id";
            queryCount+=" inner join";
            queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
            queryCount+=" on meet.account_id = tf.account_id and meet.employee_id = tf.employee_id";
            queryCount+=" left join";
            queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            queryCount+=" on meet.meeting_lead_id = drv.lead_id";
            queryCount+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
            queryCount+=" and tf.TimeFrame =" +filters.time_frame + " ";
            queryCount+=" and date(meet.Meeting_completd_dt) between tf.Start_Date and tf.End_Date  and meet.agent_id is null";
            queryCount+=" group by 1,2,3,5,6,7,8";
            queryCount+=" order by meet.Meeting_completd_dt asc";



            // }



            callback(querySelect,queryCount);


        });

    };

    var executeQueryForMeetingsCallsCompleted =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];


            async.forEachSeries(Ob,function(o,callback){



                var json = {"md": o.Meeting_Complete_Date};
                //return res.send(json);
                var ds = JSON.stringify(json);

                var dO = JSON.parse(ds);

                if(process.env.NODE_ENV == 'production')
                    var meeting_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").utcOffset(0).format("ddd,DD MMM-hh:mm a");
                else
                    var meeting_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").format("ddd,DD MMM-hh:mm a");

                var temp = {};

                temp.Text1 = toTitleCase(o.Activity_Type)+ " with "+ o.Contact_name;
                if(al.access_level == 2) {
                    temp.Text2 = meeting_date + " ,Assigned to: " + o.Activity_Owner;
                }else{
                    temp.Text2 = meeting_date;
                }
                temp.DealOwner = o.Deal_Owner || null;
                temp.ActivityOwner = o.Activity_Owner || null;
                temp.ContactName = o.Contact_name || null;
                temp.OrganizationName = o.Organization_name || null;
                temp.Product = o.Product || null;
                temp.Purpose = o.Purpose || null;
                temp.ActivityType = o.Activity_Type || null;
                temp.MeetingDate = meeting_date;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


     var  queryForMeetingsAdded = function(req,res,employeeId,filters,callback){

        reportingPerson.all(req,res,employeeId,function(empObject){

            // if(empObject.length == 0){
            //
            //     var querySelect = "select";
            //     querySelect+=" drv.lead_contact_nm as Contact_name, drv.lead_org_nm as Organization_name, drv.lead_product_name as Product,";
            //     querySelect+=" meet.meeting_purpose as Purpose, meet.meeting_type as Activity_Type, meet.meeting_schedule_dt as Meeting_Date";
            //     querySelect+=" from";
            //     querySelect+=" dwdb.EMP_LEAD_CALL_DIM meet";
            //     querySelect+=" left join";
            //     querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            //     querySelect+=" on meet.meeting_lead_id = drv.lead_id";
            //     querySelect+=" inner join";
            //     querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
            //     querySelect+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id";
            //     querySelect+=" where meet.employee_id="+employeeId+" ";
            //     querySelect+=" and tf.TimeFrame =" +filters.time_frame + " ";
            //     querySelect+=" and date(meet.meeting_initial_create_dt) between tf.Start_Date and tf.End_Date";
            //     querySelect+=" group by 1,2,3,4,5";
            //     querySelect+=" order by meet.meeting_schedule_dt asc  LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";
            //
            //
            //
            //
            //     var queryCount = "select";
            //     queryCount+=" drv.lead_contact_nm as Contact_name, drv.lead_org_nm as Organization_name, drv.lead_product_name as Product,";
            //     queryCount+=" meet.meeting_purpose as Purpose, meet.meeting_type as Activity_Type, meet.meeting_schedule_dt as Meeting_Date";
            //     queryCount+=" from";
            //     queryCount+=" dwdb.EMP_LEAD_CALL_DIM meet";
            //     queryCount+=" left join";
            //     queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            //     queryCount+=" on meet.meeting_lead_id = drv.lead_id";
            //     queryCount+=" inner join";
            //     queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
            //     queryCount+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id";
            //     queryCount+=" where meet.employee_id="+employeeId+" ";
            //     queryCount+=" and tf.TimeFrame =" +filters.time_frame + " ";
            //     queryCount+=" and date(meet.meeting_initial_create_dt) between tf.Start_Date and tf.End_Date";
            //     queryCount+=" group by 1,2,3,4,5";
            //     queryCount+=" order by meet.meeting_schedule_dt asc";
            //
            // }else{


                var querySelect = "select";
                querySelect+=" drv.emp_full_nm as Deal_Owner, drv.lead_contact_nm as Contact_name, drv.lead_org_nm as Organization_name,";
                querySelect+=" drv.lead_product_name as Product,";
                querySelect+=" meet.meeting_purpose as Purpose, meet.meeting_type as Activity_Type, meet.meeting_schedule_dt as Meeting_Date";
                querySelect+=" from";
                querySelect+=" dwdb.EMP_LEAD_CALL_DIM meet";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                querySelect+=" on meet.meeting_lead_id = drv.lead_id";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
                querySelect+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_HIER_DIM emp_hier";
                querySelect+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                querySelect+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                querySelect+=" and tf.TimeFrame =" +filters.time_frame + " ";
                querySelect+=" and date(meet.meeting_initial_create_dt) between tf.Start_Date and tf.End_Date";
                querySelect+=" group by 1,2,3,4,5";
                querySelect+=" order by meet.meeting_schedule_dt asc LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";





                var queryCount = "select";
                queryCount+=" drv.emp_full_nm as Deal_Owner, drv.lead_contact_nm as Contact_name, drv.lead_org_nm as Organization_name,";
                queryCount+=" drv.lead_product_name as Product,";
                queryCount+=" meet.meeting_purpose as Purpose, meet.meeting_type as Activity_Type, meet.meeting_schedule_dt as Meeting_Date";
                queryCount+=" from";
                queryCount+=" dwdb.EMP_LEAD_CALL_DIM meet";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                queryCount+=" on meet.meeting_lead_id = drv.lead_id";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
                queryCount+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_HIER_DIM emp_hier";
                queryCount+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                queryCount+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                queryCount+=" and tf.TimeFrame =" +filters.time_frame + " ";
                queryCount+=" and date(meet.meeting_initial_create_dt) between tf.Start_Date and tf.End_Date";
                queryCount+=" group by 1,2,3,4,5";
                queryCount+=" order by meet.meeting_schedule_dt asc";



            // }



            callback(querySelect,queryCount);


        });

    };

     var  executeQueryForMeetingsAdded =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){



                var json = {"md": o.Meeting_Date};
                //return res.send(json);
                var ds = JSON.stringify(json);

                var dO = JSON.parse(ds);

                if(process.env.NODE_ENV == 'production')
                    var meeting_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").utcOffset(0).format("ddd,DD MMM-hh:mm a");
                else
                    var meeting_date = moment(dO.md,"YYYY-MM-DDTHH:mm:ss").format("ddd,DD MMM-hh:mm a");

                var temp = {};

                temp.Text1 = toTitleCase(o.Activity_Type)+ " with "+ o.Contact_name;
                if(al.access_level == 2) {
                    temp.Text2 = meeting_date + " ,Assigned to: " + o.Activity_Owner;
                }else{
                    temp.Text2 = meeting_date;
                }
                temp.ActivityOwner = o.Activity_Owner || null;
                temp.ContactName = o.Contact_name || null;
                temp.OrganizationName = o.Organization_name || null;
                temp.Product = o.Product || null;
                temp.Purpose = o.Purpose || null;
                temp.ActivityType = o.Activity_Type || null;
                temp.MeetingDate = meeting_date;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};



    var  queryForNewLeadAdded = function(req,res,employeeId,filters,callback){

        reportingPerson.all(req,res,employeeId,function(empObject){




                var querySelect = "select";
                querySelect+=" drv.emp_full_nm as Deal_Owner,drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,";
                querySelect+="  GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,count(drv.lead_product_name) as No_of_Units,";
                querySelect+=" sum(lead_amount) Amount,max(drv.lead_stage_name) as Lead_Stage, max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(lead_expectd_Clouser_Dt as date)) as Expected_Close_Date";
                querySelect+=" from";
                querySelect+=" dwdb.EMP_HIER_DIM emp_hier";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                querySelect+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
                querySelect+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id";
                querySelect+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                querySelect+=" and tf.TimeFrame ="+filters.time_frame+" ";
                querySelect+=" and date(drv.lead_initial_create_dt) between tf.Start_Date and tf.End_Date";
                querySelect+=" group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm";
                querySelect+=" order by Lead_Generation_Date asc  LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";




                var queryCount = "select";
                queryCount+=" drv.emp_full_nm as Deal_Owner, drv.lead_id,drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,";
                queryCount+="  GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,count(drv.lead_product_name) as No_of_Units,";
                queryCount+=" sum(lead_amount) Amount,lead_stage_name as Lead_Stage, max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(lead_expectd_Clouser_Dt as date)) as Expected_Close_Date";
                queryCount+=" from";
                queryCount+=" dwdb.EMP_HIER_DIM emp_hier";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                queryCount+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
                queryCount+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id";
                queryCount+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                queryCount+=" and tf.TimeFrame ="+filters.time_frame+" ";
                queryCount+=" and date(drv.lead_initial_create_dt) between tf.Start_Date and tf.End_Date";
                queryCount+=" group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm";
                queryCount+=" order by Lead_Generation_Date asc";



            // }



            callback(querySelect,queryCount);


        });

    };

    var executeQueryForNewLeadAdded =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
           // res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){


                var temp = {};

                temp.Text1 =  o.Deal_Name;
                temp.Text2 =  o.Amount+", "+o.Contact_Name; //+", Assigned To: "+o.emp_full_nm || null;
                temp.LeadId = o.lead_id || null;
                temp.EmpFullName = o.emp_full_nm || null;
                temp.DealOwner = o.Deal_Owner || null
                temp.DealName = o.Deal_Name;
                temp.Amount = o.Amount;
                temp.ContactName = o.Contact_Name;
                temp.EmpRole = o.emp_role || null;
                temp.Supervisor = o.supervisor || null;
                temp.MetricNm = o.metric_nm || null;
                temp.ReportGenOn = o.Report_Gen_on;
                temp.OrganizationName = o.Organization_Name;
                temp.ProductName = o.product_name || null;
                temp.NoofUnits = o.No_of_Units;
                temp.LeadGenerationDate = o.Lead_Generation_Date;
                temp.WonDate = o.Won_Date;
                temp.DealAgePipeLine = o.Deal_Age_PipeLine;
                temp.ExpectedClosureDate = o.Expected_Close_Date || null;
                temp.LeadStage = o.Lead_Stage || null;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                //response(res).page(tempObject);

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


    var  queryForReferralsGenerated = function(req,res,employeeId,filters,callback){

        reportingPerson.all(req,res,employeeId,function(empObject){


                var querySelect = "select";
                querySelect+=" drv.emp_full_nm as Deal_Owner, drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,";
                querySelect+=" sum(lead_amount) as Amount, max(lead_stage_name) as Lead_Stage, max(drv.lead_referred_by) as Referred_By, max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(lead_expectd_Clouser_Dt as date)) as Expected_Close_Date";
                querySelect+=" from";
                querySelect+=" dwdb.EMP_HIER_DIM emp_hier";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                querySelect+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                querySelect+=" inner join";
                querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
                querySelect+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
                querySelect+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                querySelect+=" and tf.TimeFrame ="+filters.time_frame+" ";
                querySelect+=" and drv.lead_source_id = 8";
                querySelect+=" and date(drv.lead_initial_create_dt) between tf.Start_Date and tf.End_Date";
                querySelect+=" group by drv.emp_full_nm, drv.lead_name, drv.lead_id, drv.lead_contact_nm, drv.lead_org_nm";
                querySelect+=" order by Lead_Generation_Date asc LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";





                var queryCount = "select";
                queryCount+=" drv.emp_full_nm as Deal_Owner, drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name, GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,";
                queryCount+=" sum(lead_amount) as Amount, max(lead_stage_name) as Lead_Stage, max(drv.lead_referred_by) as Referred_By, max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(lead_expectd_Clouser_Dt as date)) as Expected_Close_Date";
                queryCount+=" from";
                queryCount+=" dwdb.EMP_HIER_DIM emp_hier";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
                queryCount+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
                queryCount+=" inner join";
                queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
                queryCount+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id  ";
                queryCount+=" where emp_hier.mngr_emp_id ="+employeeId+" ";
                queryCount+=" and tf.TimeFrame ="+filters.time_frame+" ";
                queryCount+=" and drv.lead_source_id = 8";
                queryCount+=" and date(drv.lead_initial_create_dt) between tf.Start_Date and tf.End_Date";
                queryCount+=" group by drv.emp_full_nm, drv.lead_name, drv.lead_id, drv.lead_contact_nm, drv.lead_org_nm";
                queryCount+=" order by Lead_Generation_Date asc ";



            // }



            callback(querySelect,queryCount);


        });

    };

    var executeQueryForReferralGenerated  =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
            //res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){


                var temp = {};

                temp.Text1 =  o.Deal_Name;
                temp.Text2 =  o.Amount+", "+o.Contact_Name; //+", Assigned To: "+o.emp_full_nm || null;
                temp.LeadId = o.lead_id || null;
                temp.EmpFullName = o.emp_full_nm || null;
                temp.DealOwner = o.Deal_Owner || null
                temp.DealName = o.Deal_Name;
                temp.Amount = o.Amount;
                temp.ContactName = o.Contact_Name;
                temp.EmpRole = o.emp_role || null;
                temp.Supervisor = o.supervisor || null;
                temp.MetricNm = o.metric_nm || null;
                temp.ReportGenOn = o.Report_Gen_on;
                temp.OrganizationName = o.Organization_Name;
                temp.ProductName = o.product_name || null;
                temp.NoofUnits = o.No_of_Units;
                temp.LeadGenerationDate = o.Lead_Generation_Date;
                temp.WonDate = o.Won_Date;
                temp.DealAgePipeLine = o.Deal_Age_PipeLine;
                temp.ExpectedClosureDate = o.Expected_Close_Date || null;
                temp.LeadStage = o.Lead_Stage || null;
                temp.ReferredBy = o.Referred_By || null;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};





     var  queryForPipeline = function(req,res,employeeId,filters,callback){

    reportingPerson.all(req,res,employeeId,function(empObject){



            var querySelect = "select";
            querySelect+=" drv.emp_full_nm as Deal_Owner, drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm ";
            querySelect+=" as Organization_Name, GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name, count(drv.lead_product_name) as No_of_Units,";
            querySelect+=" sum(lead_amount) Amount, max(drv.lead_stage_name) as Lead_Stage, max(date(coalesce(lead_stage_end_dt, current_date)) - date(lead_stage_start_dt)) as Deal_Age_in_Pipeline,";
            querySelect+=" max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(lead_expectd_Clouser_Dt as date)) as Expected_Close_Date";
            querySelect+=" from";
            querySelect+=" dwdb.EMP_HIER_DIM emp_hier";
            querySelect+=" inner join";
            querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            querySelect+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id ";
            querySelect+=" inner join";
            querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
            querySelect+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
            querySelect+=" where emp_hier.mngr_emp_id = "+employeeId+" ";
            querySelect+=" and tf.TimeFrame ='Y'";
            querySelect+=" and lead_stage_position_lvl not in (7,8) ";
            querySelect+=" and date(drv.lead_initial_create_dt) between tf.Start_Date and tf.End_Date";
            querySelect+=" and current_date between lead_stage_start_dt and date(coalesce(lead_stage_end_dt, current_date)) ";
            querySelect+=" group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm ";
            querySelect+=" order by Lead_Generation_Date asc LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";






            var queryCount = "select";
            queryCount+=" drv.emp_full_nm as Deal_Owner, drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm ";
            queryCount+=" as Organization_Name, GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name, count(drv.lead_product_name) as No_of_Units,";
            queryCount+=" sum(lead_amount) Amount, max(drv.lead_stage_name) as Lead_Stage, max(date(coalesce(lead_stage_end_dt, current_date)) - date(lead_stage_start_dt)) as Deal_Age_in_Pipeline,";
            queryCount+=" max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(lead_expectd_Clouser_Dt as date)) as Expected_Close_Date";
            queryCount+=" from";
            queryCount+=" dwdb.EMP_HIER_DIM emp_hier";
            queryCount+=" inner join";
            queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            queryCount+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id ";
            queryCount+=" inner join";
            queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
            queryCount+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
            queryCount+=" where emp_hier.mngr_emp_id = "+employeeId+" ";
            queryCount+=" and tf.TimeFrame ='Y'";
            queryCount+=" and lead_stage_position_lvl not in (7,8) ";
            queryCount+=" and date(drv.lead_initial_create_dt) between tf.Start_Date and tf.End_Date";
            queryCount+=" and current_date between lead_stage_start_dt and date(coalesce(lead_stage_end_dt, current_date)) ";
            queryCount+=" group by drv.emp_full_nm, drv.lead_id, drv.lead_name, drv.lead_contact_nm, drv.lead_org_nm ";
            queryCount+=" order by Lead_Generation_Date asc";



        // }



        callback(querySelect,queryCount);


    });

};

     var executeQueryForPipeline  =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


    db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

        db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
            var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
            var metricObject = [];
           // return res.send(Ob);

            async.forEachSeries(Ob,function(o,callback){


                var temp = {};

                temp.Text1 =  o.Deal_Name;
                temp.Text2 =  o.Amount+", "+o.Contact_Name; //+", Assigned To: "+o.emp_full_nm || null;
                temp.LeadId = o.lead_id || null;
                temp.EmpFullName = o.emp_full_nm || null;
                temp.DealOwner = o.Deal_Owner || null
                temp.DealName = o.Deal_Name;
                temp.Amount = o.Amount;
                temp.ContactName = o.Contact_Name;
                temp.EmpRole = o.emp_role || null;
                temp.Supervisor = o.supervisor || null;
                temp.MetricNm = o.metric_nm || null;
                temp.ReportGenOn = o.Report_Gen_on;
                temp.OrganizationName = o.Organization_Name;
                temp.ProductName = o.product_name || null;
                temp.NoofUnits = o.No_of_Units;
                temp.LeadGenerationDate = o.Lead_Generation_Date;
                temp.WonDate = o.Won_Date;
                temp.DealAgePipeLine = o.Deal_Age_in_PipeLine;
                temp.ExpectedClosureDate = o.Expected_Close_Date || null;
                temp.LeadStage = o.Lead_Stage || null;
                temp.ReferredBy = o.Referred_By || null;



                metricObject.push(temp);

                callback();


            },function(err){
                if (err) return next(err);


                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    options:tempObject,
                    items: metricObject,
                    //recordCount: items.length,
                    ServerCurrentTime: new Date().getTime()
                };

                cb(resJson);


            });


        }).catch(function(err){
            response(res).failure(err);
        });
    }).catch(function(err){
        response(res).failure(err);
    });

};


    var executeQueryLeadsDropped  =  function(req,res,filters,queryCount,querySelect,metric,al,cb){


        db.sequelize.query(queryCount,{type: db.sequelize.QueryTypes.SELECT}).then(function(qc){

            db.sequelize.query(querySelect,{type: db.sequelize.QueryTypes.SELECT}).then(function(Ob){
                var tempObject = {nextOffset: (parseInt(filters.offset) + req.limit ), limit: req.limit, totalRecords: qc.length};
                var metricObject = [];
                //res.send(Ob);

                async.forEachSeries(Ob,function(o,callback){


                    var temp = {};

                    temp.Text1 =  o.Deal_Name;
                    temp.Text2 =  o.Amount+", "+o.Contact_Name; //+", Assigned To: "+o.emp_full_nm || null;
                    temp.LeadId = o.lead_id || null;
                    temp.EmpFullName = o.emp_full_nm || null;
                    temp.DealOwner = o.Deal_Owner || null
                    temp.DealName = o.Deal_Name || null;
                    temp.Amount = o.Amount || null;
                    temp.ContactName = o.Contact_Name || null;
                    temp.EmpRole = o.emp_role || null;
                    temp.Supervisor = o.supervisor || null;
                    temp.MetricNm = o.metric_nm || null;
                    temp.ReportGenOn = o.Report_Gen_on || null;
                    temp.OrganizationName = o.Organization_Name || null;
                    temp.ProductName = o.product_name || null;
                    temp.NoofUnits = o.No_of_Units || null;
                    temp.LeadGenerationDate = o.Lead_Generation_Date || null;
                    temp.WonDate = o.Won_Date || null;
                    temp.DealAgePipeLine = o.Deal_Age_PipeLine || null;
                    temp.ExpectedClosureDate = o.Expected_Closure_Date || null;
                    temp.LeadStage = o.Lead_Stage || null;
                    temp.LeadDroppedDate = o.Lead_Dropped_Date || null;
                    temp.ReasonForLoss = o.Reason_for_Loss || null;



                    metricObject.push(temp);

                    callback();


                },function(err){
                    if (err) return next(err);


                    //response(res).page(tempObject);

                    var resJson = {
                        success: true,
                        ErrorCode : 100,
                        message: 'completed sucessfully',
                        options:tempObject,
                        items: metricObject,
                        //recordCount: items.length,
                        ServerCurrentTime: new Date().getTime()
                    };

                    cb(resJson);


                });


            }).catch(function(err){
                response(res).failure(err);
            });
        }).catch(function(err){
            response(res).failure(err);
        });

    };
    var queryForLeadsDropped = function(req,res,employeeId,filters,callback){

    reportingPerson.all(req,res,employeeId,function(empObject){



            var querySelect = "select";
            querySelect+=" drv.emp_full_nm as Deal_Owner,drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,";
            querySelect+=" sum(lead_amount) as Amount, lead_stage_name as Lead_Stage, max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Lead_Dropped_Date,";
            querySelect+=" max(drv.lead_lost_reason) as Reason_for_Loss";
            querySelect+=" from";
            querySelect+=" dwdb.EMP_HIER_DIM emp_hier";
            querySelect+=" inner join";
            querySelect+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            querySelect+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
            querySelect+=" inner join";
            querySelect+=" dwdb.EMP_TF_STRT_END_DIM tf";
            querySelect+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
            querySelect+=" where emp_hier.mngr_emp_id = "+employeeId+" ";
            querySelect+=" and tf.TimeFrame ="+filters.time_frame+" ";
            querySelect+=" and lead_stage_position_lvl = 8";
            querySelect+=" and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
            querySelect+=" group by drv.emp_full_nm, drv.lead_name, drv.lead_id, drv.lead_contact_nm, drv.lead_org_nm";
            querySelect+=" order by Lead_Dropped_Date asc LIMIT "+ req.limit +"  OFFSET "+filters.offset+"";






            var queryCount = "select";
            queryCount+=" drv.emp_full_nm as Deal_Owner,drv.lead_id, drv.lead_name as Deal_Name, drv.lead_contact_nm as Contact_Name, drv.lead_org_nm as Organization_Name,GROUP_CONCAT(drv.lead_product_name separator ', ') as product_name,";
            queryCount+=" sum(lead_amount) as Amount, lead_stage_name as Lead_Stage, max(cast(drv.lead_prospect_Dt as date)) as Lead_Generation_Date, max(cast(drv.lead_stage_start_dt as date)) as Lead_Dropped_Date,";
            queryCount+=" max(drv.lead_lost_reason) as Reason_for_Loss";
            queryCount+=" from";
            queryCount+=" dwdb.EMP_HIER_DIM emp_hier";
            queryCount+=" inner join";
            queryCount+=" dwdb.EMP_LEADS_DTL_MSTR_DIM drv";
            queryCount+=" on emp_hier.account_id = drv.emp_account_id and emp_hier.employee_id = drv.employee_id";
            queryCount+=" inner join";
            queryCount+=" dwdb.EMP_TF_STRT_END_DIM tf";
            queryCount+=" on drv.emp_account_id = tf.account_id and drv.employee_id = tf.employee_id ";
            queryCount+=" where emp_hier.mngr_emp_id = "+employeeId+" ";
            queryCount+=" and tf.TimeFrame ="+filters.time_frame+" ";
            queryCount+=" and lead_stage_position_lvl = 8";
            queryCount+=" and date(drv.lead_stage_start_dt) between tf.Start_Date and tf.End_Date";
            queryCount+=" group by drv.emp_full_nm, drv.lead_name, drv.lead_id, drv.lead_contact_nm, drv.lead_org_nm";
            queryCount+=" order by Lead_Dropped_Date asc";



        // }



        callback(querySelect,queryCount);


    });

};




    var getEmployeeAccessLevel = function(req,res,eid,filters,cb){

        db.access_level.findOne({
            where: {employee_id: req.currentUser.EmployeeId}
        }).then(function(o){

            cb(o);

        }).catch(function(err){
            response(res).failure(err);
        });

    };


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}



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
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }

        if(al && al.access_level == 2)
        {

            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    empArray.push(e.employee_id);
                });


                if(filters.emp_id)
                {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    //// console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if(empArray.indexOf(empId) != -1)
                    {

                        q = { employee_id : filters.emp_id  };
                        callback(null, clause,q,limit,offset,al,true);


                    }else
                    {
                        callback(null, clause,q,limit,offset,al,false);

                    }

                }else
                {

                    q = { employee_id : currentUser.EmployeeId ,Report_Dt :{ $eq: filters.report_date} };


                    callback(null, clause,q,limit,offset,al,true);
                }



            });


        }else if(al && al.access_level == 1)
        {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if(filters.emp_id)
            {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if(currentUser.EmployeeId == filters.emp_id)
                {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = { employee_id : filters.emp_id };
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
                q = { employee_id : currentUser.EmployeeId };


                callback(null, clause,q,limit,offset,al,true);

            }




        }else
        {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause,q,limit,offset,al,false);
        }





    });
};
