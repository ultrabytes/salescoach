"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Meeting = sequelize.define('meeting',{
        meeting_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time: DataTypes.BIGINT,
        schedule: DataTypes.BIGINT,
        scheduleDate: DataTypes.BIGINT,
        purpose: DataTypes.STRING,
        completedOn: DataTypes.BIGINT,
        completedOnDate: DataTypes.BIGINT,
        location: DataTypes.STRING,
        reviewedOn: DataTypes.BIGINT,
        reviewedOnDate: DataTypes.BIGINT,
        reviewStatus: DataTypes.BIGINT,
        q1: DataTypes.STRING,
        q2: DataTypes.STRING,
        q3: DataTypes.STRING,
        q4: DataTypes.STRING,
        q5: DataTypes.STRING,
        leadStageName: DataTypes.STRING,
        leadStageData: DataTypes.STRING,
        note: DataTypes.STRING,
        contact_id: DataTypes.INTEGER,
        meeting_type_id: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        lead_id: DataTypes.INTEGER,
        agent_id:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN

    },{
        instanceMethods: {
            toModel: function (contactObject,leadObject,agentObject,noteObject) {
                var entity = this;
                var contact_id=null
                var lead_id = null;
                var agent_id = null;
                if(contactObject)
                {
                     contact_id = contactObject.ContactId;
                }
                if(leadObject)
                {
                    lead_id = leadObject.LeadId;
                }

                if(agentObject)
                {
                    agent_id = agentObject.AgentId;
                }
                var obj = {
                    MeetingId: entity.meeting_id,
                    Time: entity.time,
                    Schedule : entity.schedule,
                    ScheduleDate: entity.scheduleDate,
                    Purpose: entity.purpose,
                    CompletedOn: entity.completedOn,
                    completedOnDate : entity.completedOnDate,
                    Location: entity.location,
                    Reviewedon: entity.reviewedOn,
                    Reviewedondate: entity.reviewedOnDate,
                    Reviewstatus: entity.reviewStatus,
                    Q1: entity.q1,
                    Q2: entity.q2,
                    Q3: entity.q3,
                    Q4: entity.q4,
                    Q5: entity.q5,
                    LeadStageName: entity.leadStageName,
                    LeadStageData: entity.leadStageData,
                    ContactId: contact_id,
                    Contact : contactObject || null,
                    MeetingTypeId: entity.meeting_type_id,
                    EmployeeId: entity.employee_id,
                    //AccountId: entity.account_id || null,
                   // Employee: currentUser,
                    LeadId: lead_id,
                    Lead : leadObject || null,
                    AgentId : agent_id,
                    Agent : agentObject || null,
                    Note:entity.note || null,
                    Notes: noteObject || null,
                    IsActive: entity.active,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
                return obj;
            },

            toModelPost: function (contactObject,leadObject,agentObject,noteObject,localId) {
                var entity = this;
                var contact_id=null
                var lead_id = null;
                var agent_id = null;
                if(contactObject)
                {
                     contact_id = contactObject.ContactId;
                }
                if(leadObject)
                {
                    lead_id = leadObject.LeadId;
                }

                if(agentObject)
                {
                    agent_id = agentObject.AgentId;
                }
                var obj = {
                    MeetingId: entity.meeting_id,
                    LocalId:localId || null,
                    Time: entity.time,
                    Schedule : entity.schedule,
                    ScheduleDate: entity.scheduleDate,
                    Purpose: entity.purpose,
                    CompletedOn: entity.completedOn,
                    completedOnDate : entity.completedOnDate,
                    Location: entity.location,
                    Reviewedon: entity.reviewedOn,
                    Reviewedondate: entity.reviewedOnDate,
                    Reviewstatus: entity.reviewStatus,
                    Q1: entity.q1,
                    Q2: entity.q2,
                    Q3: entity.q3,
                    Q4: entity.q4,
                    Q5: entity.q5,
                    LeadStageName: entity.leadStageName,
                    LeadStageData: entity.leadStageData,
                    ContactId: contact_id,
                    Contact : contactObject || null,
                    MeetingTypeId: entity.meeting_type_id,
                    EmployeeId: entity.employee_id,
                    //AccountId: entity.account_id || null,
                   // Employee: currentUser,
                    LeadId: lead_id,
                    Lead : leadObject || null,
                    AgentId : agent_id,
                    Agent : agentObject || null,
                    Note:entity.note || null,
                    Notes: noteObject || null,
                    IsActive: entity.active,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
                return obj;
            },
            toModelUpdate: function()
            {
                 var entity = this;
                 var obj = {
                    MeetingId: entity.meeting_id,
                    Time: entity.time,
                    Schedule : entity.schedule,
                    ScheduleDate: entity.scheduleDate,
                    Purpose: entity.purpose,
                    CompletedOn: entity.completedOn,
                    completedOnDate : entity.completedOnDate,
                    Location: entity.location,
                    Reviewedon: entity.reviewedOn,
                    Reviewedondate: entity.reviewedOnDate,
                    Reviewstatus: entity.reviewStatus,
                    Q1: entity.q1 || null,
                    Q2: entity.q2 || null,
                    Q3: entity.q3 || null,
                    Q4: entity.q4 || null,
                    Q5: entity.q5 || null,
                    LeadStageName: entity.leadStageName || null,
                    LeadStageData: entity.leadStageData || null,
                    ContactId: entity.contact_id || null,
                    MeetingTypeId: entity.meeting_type_id || null,
                    EmployeeId: entity.employee_id || null,
                    //AccountId: entity.account_id || null,
                    LeadId: entity.lead_id || null,
                    AgentId : entity.agent_id || null,
                    Note:entity.note || null,
                    IsActive: entity.active,
                    InitialCreate: entity.initial_create || null,
                    LastUpdated: entity.last_updated || null
                };


                return obj;



            }
        },freezeTableName: true,
    });
    return Meeting;
};




