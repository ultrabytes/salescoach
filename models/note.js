"use strict";
module.exports = function(sequelize , DataTypes){
    var Note = sequelize.define('note', {
        note_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        text: DataTypes.STRING,
        addedOn: DataTypes.BIGINT,
        contact_id: DataTypes.INTEGER,         
        employee_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        meeting_id: DataTypes.INTEGER,
        agent_id: DataTypes.INTEGER,
        lead_id: DataTypes.INTEGER,         
       initial_create: DataTypes.BIGINT,
       last_updated: DataTypes.BIGINT,         
       active: DataTypes.BOOLEAN
    },{
        instanceMethods: {             
            toModel: function () {
                var entity = this;
                var obj = {
                    NoteId: entity.note_id,
                    Text: entity.text,
                    Addedon: entity.addedOn,
                    ContactId: entity.contact_id,
                    EmployeeId: entity.employee_id,
                    MeetingId: entity.meeting_id,
                    AgentId: entity.agent_id,
                    LeadId: entity.lead_id,
                    IsActive: entity.active,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
 
                return obj;
            },

            toModelGetAll: function(){



                var entity = this;
                if(entity.lead && entity.lead.contact!= null){
                    var Lead = entity.lead.toModel();
                    var lead_id = entity.lead_id;
                }else{
                    var Lead = null;
                    var lead_id = null;
                }
                var obj = {
                    NoteId: entity.note_id,
                    Text: entity.text,
                    Addedon: entity.addedOn,
                    ContactId: entity.contact_id,
                    EmployeeId: entity.employee_id,
                    MeetingId: entity.meeting_id,
                    AgentId: entity.agent_id,
                    Lead: Lead,
                    LeadId: lead_id,
                    IsActive: entity.active,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
 
                return obj;


            }
        },freezeTableName: true,
    });
    return Note;
};
