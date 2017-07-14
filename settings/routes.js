var scheduler = require('../scheduler/schduleRunner');
var moment = require('moment');
moment.tz.setDefault("Asia/Kolkata");
var crossdomain = require('crossdomain');
var xml = crossdomain({ domain: 'localhost:8888' });



//var contact = require('../api/controller/contactController');
//var lead = require('../api/controller/leadController');
//var leadSource = require('../api/controller/leadSourceController');
//var meeting = require('../api/controller/meetingController');
//var notes = require('../api/controller/noteController');
//var organization = require('../api/controller/organizationController');
//var task = require('../api/controller/taskController');
//var state = require('../api/controller/stateController');
//var meetingType = require('../api/controller/meetingTypeController');
//var product = require('../api/controller/productController');
//var amc = require('../api/controller/amcController');
//var employee = require('../api/controller/employeeController');
//var team = require('../api/controller/teamController');
var uploader = require('../api/controller/uploader');
//var performance = require('../api/controller/performanceController');
//var agent = require('../api/controller/agentController');
//var agentOrganization = require('../api/controller/agentOrganizationController');

//var v2contact = require('../api/v2/contacts');
//var v2leads = require('../api/v2/leads');
//var v2notes = require('../api/v2/notes');
//var v2meetings = require('../api/v2/meetings');
//var v2tasks = require('../api/v2/tasks');
//var v2leadSource = require('../api/v2/leadSources');
//var v2product = require('../api/v2/products');
//var v2meetingType = require('../api/v2/meetingTypes');
//var v2amcs = require('../api/v2/amcs');
//var v2agents = require('../api/v2/agents');
//var v2performance = require('../api/v2/performances');

//code by charan New
var v2core = require('../api/v2/core');
var v2industry = require('../api/v2/industry');
var v2organization = require('../api/v2/organization');
var v2currency = require('../api/v2/currency');
var v2region = require('../api/v2/region');
var v2subregion = require('../api/v2/subregion');
var v2account = require('../api/v2/account');
var v2accessLevel = require('../api/v2/accessLevel');
var v2agentStageSettings = require('../api/v2/agent_stage_settings');
var v2role = require('../api/v2/role');
var v2meetingtype = require('../api/v2/meetingtype');
var v2agent_status = require('../api/v2/agent_status');
var v2product = require('../api/v2/product');
var v2product_industry_mapping = require('../api/v2/product_industry_mapping');
var v2target_selection_type = require('../api/v2/target_selection_type');
var v2screen_module = require('../api/v2/screen_module');
var v2screen_field = require('../api/v2/screen_field');
var v2screen_field_master = require('../api/v2/screen_field_master');
var v2screen_picklist = require('../api/v2/screen_picklist');
var v2screen_base_display = require('../api/v2/screen_base_display');
var v2target_type_mapping = require('../api/v2/target_type_mapping');
var v2target_selection_sub_type = require('../api/v2/target_selection_sub_type');
var v2agents = require('../api/v2/agent');
var v2amc = require('../api/v2/amc');
var v2lead = require('../api/v2/lead');
var v2employee = require('../api/v2/employee');
var v2agent_stage = require('../api/v2/agent_stage');
var v2leadsource = require('../api/v2/leadsource');
var v2meeting = require('../api/v2/meeting');
var v2note = require('../api/v2/note');
var v2task = require('../api/v2/task');
var v2team = require('../api/v2/team');
var v2contact = require('../api/v2/contact');
var v2contactAssign = require('../api/v2/contact_assign');
var v2agentAssign = require('../api/v2/agent_assign');
var v2leadAssign = require('../api/v2/lead_assign');
var v2organizationAssign = require('../api/v2/organization_assign');
var v2resetPassword = require('../api/v2/reset_password');
var v2forgotPassword = require('../api/v2/forgot_password');
var v2dsrSubmit = require('../api/v2/dsr_submit');
var v2ReportingPerson = require('../api/v2/reporting_person');
var v2RpDealPipeline = require('../api/v2/rp_deal_pipeline');
var v2AgentInPipeline = require('../api/v2/agent_pipeline');
var v2pu = require('../api/v2/pu');
var v2productSetting = require('../api/v2/product_settings');
var v2metricConfig = require('../api/v2/metric_config');
var v2metricConfigAcc = require('../api/v2/metric_config_acc');
var v2metricReport = require('../api/v2/metric_report');
var v2performanceTarget = require('../api/v2/sp_rolup_brdge_fact');
var v2performanceTargetGraph = require('../api/v2/sp_rolup_brdge_fact_graph');
var v2performanceSBP = require('../api/v2/mt_sp_sale_prdt_f');
var v2performanceSBPG = require('../api/v2/mt_sp_sale_prdt_f_graph');
var v2performanceHEATMAP = require('../api/v2/performance_heatmap');
var v2productLeadMapping = require('../api/v2/product_lead_mapping');
var v2metricReportHeaderMapping = require('../api/v2/metric_report_header_mapping');
var v2LeadIndicatorMessage = require('../api/v2/lead_indicator_message');
var v2FileUpload = require('../api/v2/file_upload');
var v2LeadDocMapping = require('../api/v2/lead_doc_mapping');
var v2leadStageSettings = require('../api/v2/lead_stage_settings');
var v2leadStatusSettings = require('../api/v2/lead_status_settings');
var v2DealRiskFact = require('../api/v2/deal_risk_fact');


/*var db = require('../models');*/
var jwt    = require('jsonwebtoken');

module.exports.configureRouting = function(app, auth) {

    //new APIS
    app.get('/v2/GetUpdatedTableNames', auth.requiresToken, auth.checkUser, v2core.all);

    app.get('/v2/industry', auth.requiresToken, auth.checkUser, v2industry.all);
    app.get('/v2/industry/:id', auth.requiresToken, auth.checkUser, v2industry.get);
    app.put('/v2/industry/:id', auth.requiresToken, auth.checkUser, v2industry.createOrUpdate);
    app.delete('/v2/industry/:id', auth.requiresToken, auth.checkUser, v2industry.delete);
    app.post('/v2/industry', auth.requiresToken, auth.checkUser, v2industry.createOrUpdate);

    app.get('/v2/organization', auth.requiresToken, auth.checkUser, v2organization.all);
    app.get('/v2/organization/:id', auth.requiresToken, auth.checkUser, v2organization.get);
    app.put('/v2/organization/:id', auth.requiresToken, auth.checkUser, v2organization.createOrUpdate);
    app.post('/v2/organization', auth.requiresToken, auth.checkUser, v2organization.createOrUpdate);
    app.delete('/v2/organization/:id', auth.requiresToken, auth.checkUser, v2organization.delete);

    app.get('/v2/currency', auth.requiresToken, auth.checkUser, v2currency.all);
    app.get('/v2/currency/:id', auth.requiresToken, auth.checkUser, v2currency.get);
    app.put('/v2/currency/:id', auth.requiresToken, auth.checkUser, v2currency.createOrUpdate);
    app.delete('/v2/currency/:id', auth.requiresToken, auth.checkUser, v2currency.delete);
    app.post('/v2/currency', auth.requiresToken, auth.checkUser, v2currency.createOrUpdate);

    app.get('/v2/region', auth.requiresToken, auth.checkUser, v2region.all);
    app.get('/v2/region/:id', auth.requiresToken, auth.checkUser, v2region.get);
    app.put('/v2/region/:id', auth.requiresToken, auth.checkUser, v2region.createOrUpdate);
    app.post('/v2/region', auth.requiresToken, auth.checkUser, v2region.createOrUpdate);

    app.get('/v2/subregion', auth.requiresToken, auth.checkUser, v2subregion.all);
    app.get('/v2/subregion/:id', auth.requiresToken, auth.checkUser, v2subregion.get);
    app.put('/v2/subregion/:id', auth.requiresToken, auth.checkUser, v2subregion.createOrUpdate);
    app.post('/v2/subregion', auth.requiresToken, auth.checkUser, v2subregion.createOrUpdate);

    app.get('/v2/account', auth.requiresToken, auth.checkUser, v2account.all);
    app.get('/v2/account/:id', auth.requiresToken, auth.checkUser, v2account.get);
    app.put('/v2/account/:id', auth.requiresToken, auth.checkUser, v2account.createOrUpdate);
    app.delete('/v2/account/:id', auth.requiresToken, auth.checkUser, v2account.delete);
    app.post('/v2/account', auth.requiresToken, auth.checkUser, v2account.createOrUpdate);

    app.get('/v2/role', auth.requiresToken, auth.checkUser, v2role.all);
    app.get('/v2/role/:id', auth.requiresToken, auth.checkUser, v2role.get);
    app.put('/v2/role/:id', auth.requiresToken, auth.checkUser, v2role.createOrUpdate);
    app.delete('/v2/role/:id', auth.requiresToken, auth.checkUser, v2role.delete);
    app.post('/v2/role', auth.requiresToken, auth.checkUser, v2role.createOrUpdate);

    app.get('/v2/meetingtype', auth.requiresToken, auth.checkUser, v2meetingtype.all);
    app.get('/v2/meetingtype/:id', auth.requiresToken, auth.checkUser, v2meetingtype.get);
    app.put('/v2/meetingtype/:id', auth.requiresToken, auth.checkUser, v2meetingtype.update);
    app.delete('/v2/meetingtype/:id', auth.requiresToken, auth.checkUser, v2meetingtype.delete);
    app.post('/v2/meetingtype', auth.requiresToken, auth.checkUser, v2meetingtype.createOrUpdate);

    /*** access level ***/
    app.get('/v2/access_level', auth.requiresToken, auth.checkUser, v2accessLevel.all);
    app.get('/v2/access_level/:id', auth.requiresToken, auth.checkUser, v2accessLevel.get);
    app.put('/v2/access_level/:id', auth.requiresToken, auth.checkUser, v2accessLevel.createOrUpdate);
    app.delete('/v2/access_level/:id', auth.requiresToken, auth.checkUser, v2accessLevel.delete);
    app.post('/v2/access_level', auth.requiresToken, auth.checkUser, v2accessLevel.createOrUpdate);

    /** access level ends **/

    app.get('/v2/lead/lead_stage_setting', auth.requiresToken, auth.checkUser,v2leadStageSettings.all);
    app.get('/v2/lead/lead_status_setting', auth.requiresToken, auth.checkUser,v2leadStatusSettings.all);
    app.get('/v2/agent/agent-stage-setting', auth.requiresToken, auth.checkUser,v2agentStageSettings.all);



    app.get('/v2/agent_status', auth.requiresToken, auth.checkUser, v2agent_status.all);
    app.get('/v2/agent_status/:id', auth.requiresToken, auth.checkUser, v2agent_status.get);
    app.put('/v2/agent_status/:id', auth.requiresToken, auth.checkUser, v2agent_status.createOrUpdate);
    app.delete('/v2/agent_status/:id', auth.requiresToken, auth.checkUser, v2agent_status.delete);
    app.post('/v2/agent_status', auth.requiresToken, auth.checkUser, v2agent_status.createOrUpdate);

    app.get('/v2/product', auth.requiresToken, auth.checkUser, v2product.all);
    app.get('/v2/product/:id', auth.requiresToken, auth.checkUser, v2product.get);
    app.put('/v2/product/:id', auth.requiresToken, auth.checkUser, v2product.createOrUpdate);
    app.post('/v2/product', auth.requiresToken, auth.checkUser, v2product.createOrUpdate);
    app.delete('/v2/product/:id', auth.requiresToken, auth.checkUser, v2product.delete);

    app.get('/v2/product_industry_mapping', auth.requiresToken, auth.checkUser, v2product_industry_mapping.all);
    app.get('/v2/product_industry_mapping/:id', auth.requiresToken, auth.checkUser, v2product_industry_mapping.get);
    app.put('/v2/product_industry_mapping/:id', auth.requiresToken, auth.checkUser, v2product_industry_mapping.createOrUpdate);
    app.delete('/v2/product_industry_mapping/:id', auth.requiresToken, auth.checkUser, v2product_industry_mapping.delete);
    app.post('/v2/product_industry_mapping', auth.requiresToken, auth.checkUser, v2product_industry_mapping.createOrUpdate);

    app.get('/v2/target_selection_type', auth.requiresToken, auth.checkUser, v2target_selection_type.all);
    app.get('/v2/target_selection_type/:id', auth.requiresToken, auth.checkUser, v2target_selection_type.get);
    app.put('/v2/target_selection_type/:id', auth.requiresToken, auth.checkUser, v2target_selection_type.createOrUpdate);
    app.post('/v2/target_selection_type', auth.requiresToken, auth.checkUser, v2target_selection_type.createOrUpdate);

    app.get('/v2/screen_module', auth.requiresToken, auth.checkUser, v2screen_module.all);
    app.get('/v2/screen_module/:id', auth.requiresToken, auth.checkUser, v2screen_module.get);
    app.put('/v2/screen_module/:id', auth.requiresToken, auth.checkUser, v2screen_module.createOrUpdate);
    app.post('/v2/screen_module', auth.requiresToken, auth.checkUser, v2screen_module.createOrUpdate);
    app.delete('/v2/screen_module/:id', auth.requiresToken, auth.checkUser, v2screen_module.delete);

    app.get('/v2/screen_field', auth.requiresToken, auth.checkUser, v2screen_field.all);
    app.get('/v2/screen_field/:id', auth.requiresToken, auth.checkUser, v2screen_field.get);
    app.put('/v2/screen_field/:id', auth.requiresToken, auth.checkUser, v2screen_field.createOrUpdate);
    app.post('/v2/screen_field', auth.requiresToken, auth.checkUser, v2screen_field.createOrUpdate);
    app.get('/v2/screen_field_master',auth.requiresToken, auth.checkUser, v2screen_field_master.all);
    app.get('/v2/screen_picklist', auth.requiresToken, auth.checkUser, v2screen_picklist.all);
    app.get('/v2/screen_picklist/:id', auth.requiresToken, auth.checkUser, v2screen_picklist.get);
    app.put('/v2/screen_picklist/:id', auth.requiresToken, auth.checkUser, v2screen_picklist.createOrUpdate);
    app.post('/v2/screen_picklist', auth.requiresToken, auth.checkUser, v2screen_picklist.createOrUpdate);

    app.get('/v2/screen_base_display', auth.requiresToken, auth.checkUser, v2screen_base_display.all);
    app.get('/v2/screen_base_display/:id', auth.requiresToken, auth.checkUser, v2screen_base_display.get);
    app.put('/v2/screen_base_display/:id', auth.requiresToken, auth.checkUser, v2screen_base_display.createOrUpdate);
    app.post('/v2/screen_base_display', auth.requiresToken, auth.checkUser, v2screen_base_display.createOrUpdate);

    app.get('/v2/target_type_mapping', auth.requiresToken, auth.checkUser, v2target_type_mapping.all);
    app.get('/v2/target_type_mapping/:id', auth.requiresToken, auth.checkUser, v2target_type_mapping.get);
    app.put('/v2/target_type_mapping/:id', auth.requiresToken, auth.checkUser, v2target_type_mapping.createOrUpdate);
    app.post('/v2/target_type_mapping', auth.requiresToken, auth.checkUser, v2target_type_mapping.createOrUpdate);
        
    app.get('/v2/target_selection_sub_type', auth.requiresToken, auth.checkUser, v2target_selection_sub_type.all);
    app.get('/v2/target_selection_sub_type/:id', auth.requiresToken, auth.checkUser, v2target_selection_sub_type.get);
    app.put('/v2/target_selection_sub_type/:id', auth.requiresToken, auth.checkUser, v2target_selection_sub_type.createOrUpdate);
    app.post('/v2/target_selection_sub_type', auth.requiresToken, auth.checkUser, v2target_selection_sub_type.createOrUpdate);
    
    app.get('/v2/agent', auth.requiresToken, auth.checkUser, v2agents.all);
    app.get('/v2/agent/:id', auth.requiresToken, auth.checkUser, v2agents.get);
    app.put('/v2/agent/:id', auth.requiresToken, auth.checkUser, v2agents.createOrUpdate);
    app.delete('/v2/agent/:id', auth.requiresToken, auth.checkUser, v2agents.delete);
    app.post('/v2/agent', auth.requiresToken, auth.checkUser, v2agents.createOrUpdate);

    app.get('/v2/amc', auth.requiresToken, auth.checkUser, v2amc.all);
    app.get('/v2/amc/:id', auth.requiresToken, auth.checkUser, v2amc.get);
    app.put('/v2/amc/:id', auth.requiresToken, auth.checkUser, v2amc.createOrUpdate);
    app.delete('/v2/amc/:id', auth.requiresToken, auth.checkUser, v2amc.delete);
    app.post('/v2/amc', auth.requiresToken, auth.checkUser, v2amc.createOrUpdate);
    
    app.get('/v2/lead', auth.requiresToken, auth.checkUser, v2lead.all);
    app.get('/v2/lead/:id', auth.requiresToken, auth.checkUser, v2lead.get);
    app.put('/v2/lead/:id', auth.requiresToken, auth.checkUser, v2lead.createOrUpdate);
    app.post('/v2/lead', auth.requiresToken, auth.checkUser, v2lead.createOrUpdate);
    app.delete('/v2/lead/:id', auth.requiresToken, auth.checkUser, v2lead.delete);

    app.get('/v2/employee', auth.requiresToken, auth.checkUser, v2employee.all);
     app.get('/v2/employeer', auth.requiresToken, auth.checkUser, v2employee.rp);
    app.get('/v2/employee/:id', auth.requiresToken, auth.checkUser, v2employee.get);
    app.put('/v2/employee/:id', auth.requiresToken, auth.checkUser, v2employee.createOrUpdate);
    app.post('/v2/employee', auth.requiresToken, auth.checkUser, v2employee.createOrUpdate);

    app.get('/v2/agent_stage', auth.requiresToken, auth.checkUser, v2agent_stage.all);
    app.get('/v2/agent_stage/:id', auth.requiresToken, auth.checkUser, v2agent_stage.get);
    app.put('/v2/agent_stage/:id', auth.requiresToken, auth.checkUser, v2agent_stage.createOrUpdate);
    app.delete('/v2/agent_stage/:id', auth.requiresToken, auth.checkUser, v2agent_stage.delete);
    app.post('/v2/agent_stage', auth.requiresToken, auth.checkUser, v2agent_stage.createOrUpdate);

    app.get('/v2/leadsource', auth.requiresToken, auth.checkUser, v2leadsource.all);
    app.get('/v2/leadsource/:id', auth.requiresToken, auth.checkUser, v2leadsource.get);
    app.put('/v2/leadsource/:id', auth.requiresToken, auth.checkUser, v2leadsource.createOrUpdate);
    app.delete('/v2/leadsource/:id', auth.requiresToken, auth.checkUser, v2leadsource.delete);
    app.post('/v2/leadsource', auth.requiresToken, auth.checkUser, v2leadsource.createOrUpdate);

    app.get('/v2/meeting', auth.requiresToken, auth.checkUser, v2meeting.all);
    app.get('/v2/meeting/:id', auth.requiresToken, auth.checkUser, v2meeting.get);
    app.put('/v2/meeting/:id', auth.requiresToken, auth.checkUser, v2meeting.createOrUpdate);
    app.post('/v2/meeting', auth.requiresToken, auth.checkUser, v2meeting.createOrUpdate);
    app.delete('/v2/meeting/:id', auth.requiresToken, auth.checkUser, v2meeting.delete);

    app.get('/v2/note', auth.requiresToken, auth.checkUser, v2note.all);
    app.get('/v2/note/:id', auth.requiresToken, auth.checkUser, v2note.get);
    app.delete('/v2/note/:id', auth.requiresToken, auth.checkUser, v2note.delete);
    app.put('/v2/note/:id', auth.requiresToken, auth.checkUser, v2note.createOrUpdate);
    app.post('/v2/note', auth.requiresToken, auth.checkUser, v2note.createOrUpdate);

    app.get('/v2/task', auth.requiresToken, auth.checkUser, v2task.all);
    app.get('/v2/task/:id', auth.requiresToken, auth.checkUser, v2task.get);
    app.put('/v2/task/:id', auth.requiresToken, auth.checkUser, v2task.createOrUpdate);
    app.post('/v2/task', auth.requiresToken, auth.checkUser, v2task.createOrUpdate);
    app.delete('/v2/task/:id', auth.requiresToken, auth.checkUser, v2task.delete);

    app.get('/v2/team', auth.requiresToken, auth.checkUser, v2team.all);
    app.get('/v2/team/:id', auth.requiresToken, auth.checkUser, v2team.get);
    app.put('/v2/team/:id', auth.requiresToken, auth.checkUser, v2team.createOrUpdate);
    app.delete('/v2/team/:id', auth.requiresToken, auth.checkUser, v2team.delete);
    app.post('/v2/team', auth.requiresToken, auth.checkUser, v2team.createOrUpdate);

    app.get('/v2/contact', auth.requiresToken, auth.checkUser, v2contact.all);
    app.get('/v2/contact/:id', auth.requiresToken, auth.checkUser, v2contact.get);
    app.put('/v2/contact/:id', auth.requiresToken, auth.checkUser, v2contact.createOrUpdate);
    app.post('/v2/contact', auth.requiresToken, auth.checkUser, v2contact.createOrUpdate);
    app.delete('/v2/contact/:id', auth.requiresToken, auth.checkUser, v2contact.delete);


    app.post('/v2/contact/assign', auth.requiresToken, auth.checkUser, v2contactAssign.contactAssign);
    app.post('/v2/agent/assign', auth.requiresToken, auth.checkUser, v2agentAssign.agentAssign);
    app.post('/v2/lead/assign', auth.requiresToken, auth.checkUser, v2leadAssign.leadAssign);
    app.post('/v2/organization/assign', auth.requiresToken, auth.checkUser, v2organizationAssign.organizationAssign);
    app.post('/v2/reset_password',auth.requiresToken, auth.checkUser, v2resetPassword.resetPassword);
    app.post('/v2/forgot_password',v2forgotPassword.forgetPassword);
    app.post('/v2/forgot_password_confirm',v2forgotPassword.forgetPasswordConfirm);
    app.get('/v2/dsr/summary',auth.requiresToken, auth.checkUser,v2dsrSubmit.dsrSubmit);
    app.get('/v2/reporting_person',auth.requiresToken, auth.checkUser,v2ReportingPerson.reportingPerson);
    app.get('/v2/rp_deal_pipeline',auth.requiresToken, auth.checkUser,v2RpDealPipeline.all);
    app.get('/v2/agent_pipeline',auth.requiresToken, auth.checkUser,v2AgentInPipeline.all);
    app.post('/v2/pu',v2pu.submit);
    app.get('/v2/product_settings',auth.requiresToken, auth.checkUser,v2productSetting.all);
    app.get('/v2/performance/metric-conf',auth.requiresToken, auth.checkUser,v2metricConfig.all);
    app.get('/v2/performance/metric-conf-acc',auth.requiresToken, auth.checkUser,v2metricConfigAcc.all);
    app.get('/v2/performance/metric-report',auth.requiresToken, auth.checkUser,v2metricReport.all);
    app.get('/v2/performance/target_consolidated',auth.requiresToken, auth.checkUser,v2performanceTarget.all);
    app.get('/v2/performance/target_consolidated_graph',auth.requiresToken, auth.checkUser,v2performanceTargetGraph.all);
    app.get('/v2/performance/salesbyproduct',auth.requiresToken, auth.checkUser,v2performanceSBP.all);
    app.get('/v2/performance/sales-by-product-graph',auth.requiresToken, auth.checkUser,v2performanceSBPG.all);
    app.get('/v2/performance/heatmap',auth.requiresToken, auth.checkUser,v2performanceHEATMAP.all);
    app.get('/v2/product_lead_mapping',auth.requiresToken, auth.checkUser,v2productLeadMapping.all);
    app.post('/v2/product_lead_mapping',auth.requiresToken, auth.checkUser,v2productLeadMapping.create);
    app.put('/v2/product_lead_mapping',auth.requiresToken, auth.checkUser,v2productLeadMapping.update);
    app.delete('/v2/product_lead_mapping/:id',auth.requiresToken, auth.checkUser,v2productLeadMapping.delete);


    app.get('/v2/metric_report_header_mapping',auth.requiresToken, auth.checkUser,v2metricReportHeaderMapping.all);
    app.get('/v2/lead_indicator_message',auth.requiresToken, auth.checkUser,v2LeadIndicatorMessage.all);
    app.post('/v2/file_upload',auth.requiresToken, auth.checkUser,v2FileUpload.all);
    app.get('/v2/lead_doc_mapping',auth.requiresToken, auth.checkUser,v2LeadDocMapping.all);
    app.post('/v2/lead_doc_mapping',auth.requiresToken, auth.checkUser,v2LeadDocMapping.create);
    app.get('/v2/deal_risk_fact',auth.requiresToken, auth.checkUser,v2DealRiskFact.all);


    
    app.get('/v2/time',function(req,res){
       res.json({
        ServerTimeIs: new Date().getTime() , 
        TimezoneOffset: new Date().getTimezoneOffset() , 
        MomentTime: moment().utc().format('x'),
        StartOfWeek:moment().startOf('isoweek').format('x'),
        EndOfWeek:moment().endOf('isoweek').format('x'),
        StartOfMonth:  moment().startOf('month').format('x'),
        EndOfMonth: moment().endOf('month').format('x'),
        StartOfYear: moment().startOf('year').format('x'),
        EndOfYear: moment().endOf('year').format('x'),
        startOfQuarter: moment().startOf('quarter').format('x'),
        endOfQuarter: moment().endOf('quarter').format('x'),
        "16 Dec, 2016": moment("16 Dec, 2016 00:00:00","DD MMM, YYYY HH:mm:ss").format('x')
         });
    });
   
    //end 

    var authenticate = function (req, res) {
        db.employee.find({
            where: {
                email: req.body.username
            },
        }).then(function (emp) {
            if (!emp)
                return res.json({
                    success: false,
                    ErrorCode:112,
                    message: 'Invalid Username or Password'
                });

                if(emp.status == 1){

                     return res.json({ success: false,ErrorCode: 119, message: 'User Left Organization' });

                }

                if(emp.status == 2){
                         return res.json({ success: false,ErrorCode: 119, message: 'User unauthorized' });
                }

           

            if (emp.password != req.body.password) {
                return res.json({ success: false, ErrorCode:113, message: 'Invalid Password' });
            } else {

                
                var empJson = {
                    "EmployeeId": emp.employee_id,
                    "AccountId" : emp.account_id,
                    "RoleId": emp.role_id
                };
                db.employee.find(
                {
                    where: { employee_id : emp.employee_id},
                    include: [{model: db.role }]

                }).then(function(EmpObject)
                {

                    //return res.send(EmpObject);

                   db.account_setting.findOne(
                   {
                      where : { account_id : emp.account_id },
                      attributes: ['allow_duplicate_contacts']

                    }).then(function(AccSetting)
                    {
                        var AllowDuplicate = null;
                              if(AccSetting)
                              {

                                    AllowDuplicate = AccSetting.allow_duplicate_contacts;
                              }

                              db.lead_stage_settings.findAll({

                                where: { account_id : emp.account_id }
                              }).then(function(lss){

                               // res.send(EmpObject);

                                      var lssItems = lss.map(function(item){  return item.toModel(); });

                                       var token = jwt.sign(empJson, app.get('superSecret'),{ expiresIn : (86400*365) });
                                       empJson.FirstName = EmpObject.first_name;
                                       empJson.LastName = EmpObject.last_name;
                                       empJson.Email = EmpObject.email;
                                       empJson.Token = token;
                                       empJson.AccountId = EmpObject.account_id;
                                       empJson.EmployeeCode = EmpObject.employee_code;
                                       empJson.PhoneNumber = EmpObject.phone_number;
                                       empJson.BusinessUnit = EmpObject.business_unit;
                                       empJson.RoleId = EmpObject.role_id;
                                       // empJson.Role = EmpObject.role.toModel();
                                       // empJson.Role = EmpObject.role.toModel();
                                       empJson.ReportngPerson = EmpObject.reporting_person;
                                       empJson.AllowDuplicateContacts = AllowDuplicate;


                                       //empJson.LeadStageSettings = lssItems || null;
                                       empJson.Gender = EmpObject.gender;
                                       empJson.DefaultPicklist = EmpObject.default_picklist;
                                       empJson.InitialCreate = EmpObject.initial_create;
                                       empJson.LastUpdated = EmpObject.last_updated;
                                       if(EmpObject.role){
                                           empJson.Role = EmpObject.role.toModel();
                                       }else{
                                           empJson.Role = null;
                                       }

                                       emp.token = token;
                                       emp.save();

                                      return res.json({ success: true, ErrorCode : 100, items: [empJson], message: 'completed sucessfully', ServerCurrentTime: new Date().getTime(), "recordCount": 1 });
    

                              });
                             

                    });

                });

                
            }
        }).catch(function (err) {

            return res.json({ success: false, message: 'exception found ' + err });
        })
    };
    app.post('/uploadData' , uploader.bulkUpload);
    app.post('/authenticate', authenticate);
    app.post('/v2/employee/authenticate', authenticate);

    app.get('/', function (req, res) {
        res.render('index');
    });
    app.get('/getdata', function(req, res) {
    res.json('hello');
    });
    app.get('/start/scheduler',function(req, res) {
        scheduler.startExport();
        res.json(true);
    });

    app.all('/crossdomain.xml', function (req, res, next) {
          res.set('Content-Type', 'application/xml; charset=utf-8');

          res.send(xml, 200);
    });
  
     /**** remaining are invalid requests ****/

    app.all('/*', function(req, res) {
        res.json({
            success : false,
            ErrorCode : 114,
            message : "Invalid Request",
            ServerCurrentTime: new Date().getTime()
       });
   });
};
