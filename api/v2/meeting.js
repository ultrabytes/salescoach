"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var sync = require('synchronize');
var log = require("../../api_logs/create_logs");
var logFile = "meeting_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');


exports.all = function (req, res) {
    //// console.log(sequelize);
    var filters = req.query;
    var currentUser = req.currentUser;
    var currentTime = new Date().getTime();
    var reqInfo = { cont_id : null , agnt_id : null , ld_id : null, currentTime : currentTime , Notes : null , temp_notes : null };

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
            db.meeting.findAndCountAll({
                where: q || {},
                include: [
                    {model:db.contact, where: { active: true }, required: false },
                    {model:db.lead, where: { active: true },required :false, include: [{ model: db.lead_stage_calculation ,where:{active: 1},required:false },{ model: db.lead_status_calculation ,where:{active: 1},required:false},{model:db.lead_doc_mapping, where:{active:1},required:false},{model: db.product_lead_mapping ,where:{active: 1}, required: false },{model: db.organization , where: {active: 1}, required :false},{  model : db.contact, where: { $and: [{contact_id: { $ne : null }}, { active: true }] },required: false}]},
                    {model:db.agent,where: {active: true}, required:false, include:[{model: db.agent_stage_calculation, where:{active:1}, required:false}]},
                    {model:db.note , where: {active: true}, required:false}
                ],
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]

            }).then(function(meetings){

               //res.send(meetings);
                var obContact;
                var obLead;
                var obAgent;
                var obNote = null;
                var items = meetings.rows.map(function (c) {

                    // // console.log("Meeting id is--->"+c.meeting_id);

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

                            if(c.lead.product_lead_mappings){

                                obLead.LeadProdInfo =  c.lead.product_lead_mappings.map(function(i){

                                     return i.toModel();

                                });
                            }else{
                                obLead.LeadProdInfo = null;
                            }

                            if(c.lead.contact){
                                obLead.Contact = c.lead.contact.toModel();
                            }else{
                                obLead.Contact = null;
                            }
                            if(c.lead.organization){
                                obLead.Organization = c.lead.organization.toModel();
                            }else{
                                obLead.Organization = null;
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

                    try{
                        obAgent = returnAgent(c.agent);

                    }catch(e)
                    {
                        obAgent = c.agent
                    }
                    try
                    {


                        obNote = c.notes.map(function(c){
                              return c.toModel();
                        });

                    }catch(e)
                    {
                        obNote = null;
                    }


                    return c.toModel(obContact,obLead,obAgent,obNote);



                });
                var moreRecordsAvailable = false;

                if(meetings.count > meetings.rows.length)
                {
                    moreRecordsAvailable = true;
                }
                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    items: items,
                    recordCount: items.length,
                    ServerCurrentTime: new Date().getTime(),
                    moreRecordsAvailable: moreRecordsAvailable
                };

                log.run(req,resJson,"meeting_log.txt");


                res.json(resJson);



            }).catch(function(err){

                log.run(req,response(res).customError(err),logFile);
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var meetingModel = req.body;


    var id = req.params.id || meetingModel.MeetingId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.meeting.findById(id)
            .then(function (meeting) {
                toEntityUpdate(meeting, meetingModel, req.currentUser,action)
                    .save()
                    .then(function (entity) {

                        log.run(req,entity.toModelUpdate(),"meeting_log.txt");
                        response(res).data(entity.toModelUpdate());
                    })
                    .catch(function (err) {
                        log.run(req,response(res).customError(err),logFile);
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    } else
    {
        action = "create";
        log.request(req,logFile);
        var currentTime = new Date().getTime();
        var reqInfo = { cont_id : null , agnt_id : null , ld_id : null, currentTime : currentTime , Notes : null , temp_notes : null };
        var localId = req.body.LocalId || null;
        return db.sequelize.transaction().then(function(t){

            return createContact(req,res,reqInfo,t,function(obCot){

                return createLead(req,res,reqInfo,t,function(obLd){

                    return createAgent(req,res,reqInfo,t,function(obAge){

                        return db.meeting.create(toEntity({}, meetingModel, req.currentUser,action,reqInfo.cont_id,reqInfo.ld_id,reqInfo.agnt_id),{transaction:t}).then(function(entity){
                            var nO = req.body.Notes || null;
                            return createNotes(nO,req,res,entity,reqInfo,t,function(nO){
                                t.commit().then(function(){

                                    return db.meeting.find({

                                        where : { meeting_id : entity.meeting_id },
                                        include : [
                                            {model: db.contact },
                                            {model: db.lead , include: [ { model: db.lead_stage_calculation } ]},
                                            {model: db.agent},
                                            {model: db.note }
                                        ]
                                    }).then(function(meet){

                                        //return res.send(meet);
                                        var obContact;
                                        var obLead;
                                        var obAgent;
                                        var obNote;

                                        //res.send(meet);


                                        try{

                                            obContact = meet.contact.toModel();
                                            log.run(req,obContact,"contact_log.txt");


                                        }catch(e){

                                            obContact = meet.contact || null;

                                            if(req.body.ContactId)
                                            {

                                                obContact = obCot;

                                            }


                                        }



                                        try{


                                            obLead = returnLead(meet.lead);
                                            log.run(req,obLead,"lead_log.txt");


                                        }catch(e){

                                            obLead = meet.lead || null;

                                            if(req.body.LeadId)
                                            {

                                                obLead = obLd;

                                            }


                                        }


                                        try{

                                            obAgent = meet.agent.toModel();
                                            log.run(req,obAgent,"agent_log.txt");


                                        }catch(e){

                                            obAgent = meet.agent || null;

                                            if(req.body.AgentId)
                                            {

                                                obAgent = obAge;

                                            }


                                        }


                                        var NotesOb =  null;

                                        if(meet.notes){


                                            NotesOb = returnNotesObject(meet.notes,reqInfo,meet);

                                            log.run(req,NotesOb,"note_log.txt");
                                        }


                                        response(res).data(entity.toModelPost(obContact,obLead,obAgent,NotesOb,localId));

                                    }).catch(function(err){
                                        response(res).failure(err);
                                    }); // end meeting find

                                });


                            });

                        }).catch(function(err){
                            t.rollback();
                            response(res).failure(err);
                        });
                    });


                });


            });


        });



    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    var currentTime = new Date().getTime();
    var reqInfo = { cont_id : null , agnt_id : null , ld_id : null, currentTime : currentTime , Notes : null , temp_notes : null };
    db.meeting.find({
        where: {
            meeting_id: id
        },
        include: [
            {all: true},
        ]
    }).then(function (entity) {
        var obContact;
        var obLead;
        var obAgent;
        var obNote;
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


        try{
            obAgent = returnAgent(entity.agent);

        }catch(e)
        {
            obAgent = entity.agent
        }


        try
        {
            obNote = returnNotesObjects(entity.notes,reqInfo);
        }
        catch(e)
        {
            obNote = null;
        }
        log.run(req,entity.toModel(obContact,obLead,obAgent,obNote),"meeting_log.txt");
        response(res).data(entity.toModel(obContact,obLead,obAgent,obNote));

    }).catch(function (err) {
        log.run(req,response(res).customError(err),logFile);
        response(res).failure(err);
    });
};

exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.meeting.findById(id)
        .then(function (object) {
            object.active = false;
            object.last_updated = currentTime;
            object.save()
                .then(function (entity) {


                    log.run(req,response(res).returnSuccess(),"meeting_log.txt");
                    response(res).success();
                })
                .catch(function (err) {
                    response(res).failure(err);
                });
        })
        .catch(function (err) {
            response(res).failure(err);
        });
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


            // console.log("Emp Array is--->"+empArray);

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

                        q = { employee_id : filters.emp_id , last_updated : { $gt : filters.timestamp },active:true };
                        callback(null, clause,q,limit,offset,al,true);


                    }else
                    {
                        callback(null, clause,q,limit,offset,al,false);

                    }

                }else
                {

                    q = { employee_id : currentUser.EmployeeId , active: true };
                    if(filters.timestamp)
                    {
                        q = { employee_id : currentUser.EmployeeId,last_updated : { $gt : filters.timestamp }, active: true  };
                    }

                    callback(null, clause,q,limit,offset,al,true);
                }



            });


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
                    q = { employee_id : filters.emp_id , last_updated : { $gt : filters.timestamp }, active: true  };
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
                q = { employee_id : currentUser.EmployeeId, active: true  };
                if(filters.timestamp)
                {
                    q = { employee_id : currentUser.EmployeeId ,last_updated : { $gt : filters.timestamp } , active: true };
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

var toEntity = function (entity, data, currentUser,action,contact_id,lead_id,agent_id) {
    entity.time = data.Time;
    entity.account_id = currentUser.AccountId;
    entity.schedule = data.Schedule;
    entity.scheduleDate = data.ScheduleDate;
    entity.purpose = data.Purpose;
    if (data.CompletedOn != null)
        entity.completedOn = data.CompletedOn;
    entity.completedOnDate = data.completedOnDate;
    entity.location = data.Location;
    if (data.ReviewedOn != null)
        entity.reviewedOn = data.Reviewedon;
    entity.reviewedOnDate = data.Reviewedondate;
    entity.reviewStatus = data.Reviewstatus;
    entity.q1 = data.Q1;
    entity.q2 = data.Q2;
    entity.q3 = data.Q3;
    entity.q4 = data.Q4;
    entity.q5 = data.Q5;
    entity.leadStageName = data.LeadStageName;
    entity.leadStageData = data.LeadStageData;
    entity.note = data.Note;
    entity.employee_id = currentUser.EmployeeId;
    entity.meeting_type_id = data.MeetingTypeId;
    entity.contact_id = data.ContactId || contact_id;
    entity.lead_id = lead_id;
    entity.agent_id = agent_id;
    entity.checked_in_time = data.CheckedInTime;
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }


    // entity.active = data.Active;
    return entity;
};



var toEntityUpdate = function (entity, data, currentUser,action) {
    entity.time = data.Time;
    entity.account_id = currentUser.AccountId;
    entity.schedule = data.Schedule;
    entity.scheduleDate = data.ScheduleDate;
    entity.purpose = data.Purpose;
    entity.completedOn = data.CompletedOn || null;
    entity.completedOnDate = data.completedOnDate || null;
    entity.location = data.Location;
    entity.reviewedOn = data.Reviewedon || null;
    entity.reviewedOnDate = data.Reviewedondate || null;
    entity.reviewStatus = data.Reviewstatus;
    entity.q1 = data.Q1;
    entity.q2 = data.Q2;
    entity.q3 = data.Q3;
    entity.q4 = data.Q4;
    entity.q5 = data.Q5;
    entity.leadStageName = data.LeadStageName;
    entity.leadStageData = data.LeadStageData;
    entity.note = data.Note;
    //entity.employee_id = currentUser.EmployeeId;
    entity.meeting_type_id = data.MeetingTypeId;
    entity.contact_id = data.ContactId;
    entity.lead_id = data.LeadId;
    entity.agent_id = data.AgentId;
    entity.checked_in_time = data.CheckedInTime;
    entity.last_updated = new Date().getTime();
    // entity.active = data.Active;
    return entity;
};

var findMeeting = function(req,res,reqInfo,meetingResponse){


    db.meeting.findAll().then(function(meet){

        meetingResponse(meet);
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
        objectContact.organization_id = objectContact.OrganizationId;
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



function createLeadStageCalculations(LeadStageCalculations,req,res,obLead,reqInfo){

    var objectLSC = LeadStageCalculations;
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

            log.run(req,lscObject,"lead_stage_calculation_log.txt");

        }).catch(function(err){
            response(res).failure(err);
        });



    }).catch(function(err){

        response(res).failure(err);
    });


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
            active : lsc.Active,
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


function createLeadStatusCalculations(req,res,entity,t,reqInfo,lscResponse){

    var objectLSC = req.body.Lead.LeadStageCalculation;
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


function createAgent(req,res,reqInfo,t,responseAgent)
{
    var obAge = null;
    if(req.body.Agent){
        var objectAgent = req.body.Agent;

        objectAgent.name = objectAgent.Name;
        objectAgent.account_id = req.currentUser.AccountId;
        objectAgent.phone_number = objectAgent.PhoneNumber;
        objectAgent.email = objectAgent.Email;
        objectAgent.address = objectAgent.Address;
        objectAgent.age_group = objectAgent.AgeGroup;
        objectAgent.date_of_birth = objectAgent.DateOfBirth;
        objectAgent.income = objectAgent.Income;
        objectAgent.experience = objectAgent.Experience;
        objectAgent.status = objectAgent.Status;
        objectAgent.prospects_date = objectAgent.ProspectsDate;
        objectAgent.contacted_date = objectAgent.ContactedDate;
        objectAgent.interviewed_date = objectAgent.InterviewedDate;
        objectAgent.selected_date = objectAgent.SelectedDate;
        objectAgent.trained_date = objectAgent.TrainedDate;
        objectAgent.currentState = objectAgent.Currentstate;
        objectAgent.organisationName = objectAgent.Organizationname
        objectAgent.rejectionReason = objectAgent.Rejectionreason;
        objectAgent.notInterestedReason = objectAgent.Notinterestedreason;
        objectAgent.keyMilestone1 = objectAgent.Keymilestone1;
        objectAgent.keyMilestone2 = objectAgent.Keymilestone2;
        objectAgent.keyMilestone3 = objectAgent.Keymilestone3;
        objectAgent.keyMilestone4 = objectAgent.Keymilestone4;
        objectAgent.keyMilestone5 = objectAgent.Keymilestone5;
        objectAgent.keyMilestone6 = objectAgent.Keymilestone6;

        var lead_id = reqInfo.ld_id;
        var cont_id = reqInfo.cont_id;
        objectAgent.initial_create  = reqInfo.currentTime;
        objectAgent.last_updated = reqInfo.currentTime;
        objectAgent.employee_id = req.currentUser.EmployeeId;

        db.agent.create(objectAgent,{transaction:t}).then(function(agent)
        {
            reqInfo.agnt_id = agent.agent_id;
            responseAgent(true);

        }).catch(function(err){
            t.rollback();
            response(res).failure(err);
        });

    }else{


        if(req.body.AgentId){

            db.agent.find({

                where : { agent_id : req.body.AgentId }
            }).then(function(ag){

                try{
                    reqInfo.agnt_id = ag.agent_id;
                    obAge = ag.toModel();

                }catch(err){

                    obAge = null;
                }

                responseAgent(obAge);



            }).catch(function(err){
                t.rollback();
                response(res).failure(err);
            });
        }else{
            responseAgent(null);
        }
    }



}

var createNotes = function(oNotes,req,res,entity,reqInfo,t,NoteResponse){
    if(req.body.Notes){

        //res.send(req.body.Notes);
        var objectNotes = oNotes;
        var realObjectNotes = [];

        var tempJson;
        var tempNotes = [];

        for(var i in objectNotes)
        {

            var note = objectNotes[i];
            tempNotes.push({ IsRemoteSuccess : note.IsRemoteSuccess,LocalId : note.LocalId , RemoteExtra : note.RemoteExtra , RemoteMessage : note.RemoteMessage   });
            tempJson = {
                account_id: req.currentUser.AccountId,
                addedOn : note.Addedon || null,
                agent_id : note.AgentId || null,
                contact_id : note.ContactId || null,
                lead_id : note.LeadId || null,
                meeting_id : entity.meeting_id || null,
                employee_id : note.EmployeeId || req.currentUser.EmployeeId,
                initial_create : new Date().getTime(),
                last_updated : new Date().getTime(),
                text: note.Text

            }

            realObjectNotes.push(tempJson);
        }

        // res.send(realObjectNotes);
        reqInfo.temp_notes = tempNotes;

        db.note.bulkCreate(realObjectNotes,{transaction:t}).then(function(notes)
        {


            NoteResponse(notes);

        }).catch(function(err){
            t.rollback();
            response(res).failure(err);
        });
    }else{

        NoteResponse(null);
    }



}



function returnContact(obContact,req)
{
    var jsonContact = {};
    //// console.log("Contact Id is ---->"+contact_id);

    jsonContact = {

        ContactId: obContact.contact_id || null,
        //AccountId: obContact.account_id || null,
        Name : obContact.name || null,
        Number : obContact.number || null,
        Email : obContact.email || null,
        Address : obContact.address || null,
        Seen : obContact.seen,
        IsLink : obContact.isLink || null,
        EmployeeId: obContact.employee_id || null,
        OrganizationId: obContact.organization_id || null,
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

        InitialCreate:obContact.initial_create || null,
        LastUpdated:obContact.last_updated || null,
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
        AmcId: obLead.amc_id,
        EmployeeId: obLead.employee_id,
        LeadSourceId: obLead.lead_source_id,
        LeadSourceSubString: obLead.lead_source_sub_string,
        //AccountId: obLead.account_id || null,
        ProductId: obLead.product_id,
        OrganizationId: obLead.organization_id,
        WonLostByEmployeeId: obLead.won_lost_by_employee_id,
        WonLostByEmployeeName: obLead.won_lost_by_employee_name,
        LeadStageCalculation: obLSC,
        StageCalculationId:obLead.stage_calculation_id,
        Seen: obLead.seen,
        IsIndividual:obLead.is_individual,
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


function returnAgent(obAgent)
{
    var AgentStageCalculations = null;
    if(obAgent.agent_stage_calculations){

        AgentStageCalculations = obAgent.agent_stage_calculations.map(function(a){
              return a.toModel();

        });

    }
    var jsonAgent = {

        AgentId:obAgent.agent_id,
        AgentStageId: obAgent.agent_stage_id,
        StageCalculationId:obAgent.stage_calculation_id,
        //AccountId: obAgent.account_id || null,
        Name: obAgent.name,
        PhoneNumber: obAgent.phone_number,
        Email: obAgent.email,
        Address: obAgent.address,
        AgeGroup: obAgent.age_group,
        DateOfBirth:obAgent.date_of_birth,
        Income: obAgent.income,
        Experience: obAgent.experience,
        Status: obAgent.status,
        ProspectsDate: obAgent.prospects_date,
        ContactedDate: obAgent.contacted_date,
        InterviewedDate: obAgent.interviewed_date,
        SelectedDate: obAgent.selected_date,
        ExpectedClouserDate:obAgent.expectedClouserDate,
        TrainedDate: obAgent.trained_date,
        Currentstate: obAgent.currentState,
        Organizationname: obAgent.organisationName,
        Notinterestedreason: obAgent.notInterestedReason,
        Rejectionreason:obAgent.rejectionReason,
        Keymilestone1: obAgent.keyMilestone1,
        Keymilestone2: obAgent.keyMilestone2,
        Keymilestone3: obAgent.keyMilestone3,
        Keymilestone4: obAgent.keyMilestone4,
        Keymilestone5: obAgent.keyMilestone5,
        Keymilestone6: obAgent.keyMilestone6,
        EmployeeId:obAgent.employee_id,
        InitialCreate: obAgent.initial_create,
        LastUpdated: obAgent.last_updated,
        AgentStageCalculations : AgentStageCalculations
        //Active: obAgent.active
    }

    return jsonAgent;

}


function returnNotes(obNotes,reqInfo)
{
    // console.log("Temp notes is --->"+reqInfo.temp_notes);

    var realObNotes = [];
    var tempJson = {};

    for(var i in obNotes)
    {
        var note  = obNotes[i];

        tempJson = {
            NoteId : note.note_id,
            // AccountId: note.account_id || null,
            Addedon : note.addedOn,
            AgentId: note.agent_id,
            ContactId : note.contact_id,
            EmployeeId: note.employee_id,
            LeadId: note.lead_id,
            IsRemoteSuccess : reqInfo.temp_notes[i].IsRemoteSuccess || null,
            LocalId:reqInfo.temp_notes[i].LocalId || null,
            RemoteExtra:reqInfo.temp_notes[i].RemoteExtra || null,
            RemoteMessage:reqInfo.temp_notes[i].RemoteMessage || null,
            MeetingId : note.meeting_id,
            Text: note.text,
            InitialCreate : note.initial_create,
            LastUpdated : note.last_updated

        }

        realObNotes.push(tempJson);

    }

    return realObNotes;

}



function returnNotesObject(obNotes,reqInfo)
{
    //// console.log("Temp notes is --->"+reqInfo.temp_notes);

    var realObNotes = [];
    var tempJson = {};

    for(var i in obNotes)
    {
        var note  = obNotes[i];

        tempJson = {
            NoteId : note.note_id,
            // AccountId: note.account_id || null,
            Addedon : note.addedOn,
            AgentId: note.agent_id,
            ContactId : note.contact_id,
            EmployeeId: note.employee_id,
            LeadId: note.lead_id,
            IsRemoteSuccess : reqInfo.temp_notes[i].IsRemoteSuccess || null,
            LocalId:reqInfo.temp_notes[i].LocalId || null,
            RemoteExtra:reqInfo.temp_notes[i].RemoteExtra || null,
            RemoteMessage:reqInfo.temp_notes[i].RemoteMessage || null,
            MeetingId : note.meeting_id,
            Text: note.text,
            InitialCreate : note.initial_create,
            LastUpdated : note.last_updated

        }

        realObNotes.push(tempJson);

    }

    return realObNotes;

}
