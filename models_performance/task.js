"use strict";
module.exports = function(sequelize , DataTypes){
    var Task = sequelize.define('task', {
        task_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        reminder: DataTypes.BIGINT,
        dueDate: DataTypes.BIGINT,
        dueDateTime: DataTypes.BIGINT,
        completedOn: DataTypes.BIGINT,
        completedOnDate: DataTypes.BIGINT,
        contact_id: DataTypes.INTEGER,
        lead_id: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN

    },{
        instanceMethods: {             
            toModel: function (contactobject,leadObject) {
                var entity = this;
                var contact_id=null
                var lead_id = null;

                if(contactobject)
                {
                     contact_id = contactobject.ContactId;
                }
                if(leadObject)
                {
                    lead_id = leadObject.LeadId;
                }

                var obj = {
                    TaskId: entity.task_id,
                    Name: entity.name,
                    Reminder: entity.reminder,
                    Duedate: entity.dueDate,
                    Duedatetime: entity.dueDateTime,
                    Completedon: entity.completedOn,
                    Completedondate:entity.completedOnDate,
                    ContactId: contact_id,
                    Contact : contactobject || {},
                    LeadId: lead_id,
                    Lead: leadObject || {},
                    EmployeeId: entity.employee_id,
                    IsActive:entity.active,
                    //Employee: currentUser,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
 
                return obj;
            },

            toModelPost: function (contactobject,leadObject,localId) {
                var entity = this;
                var contact_id=null
                var lead_id = null;

                if(contactobject)
                {
                     contact_id = contactobject.ContactId;
                }
                if(leadObject)
                {
                    lead_id = leadObject.LeadId;
                }

                var obj = {
                    TaskId: entity.task_id,
                    LocalId: localId || null,
                    Name: entity.name,
                    Reminder: entity.reminder,
                    Duedate: entity.dueDate,
                    Duedatetime: entity.dueDateTime,
                    Completedon: entity.completedOn,
                    Completedondate:entity.completedOnDate,
                    ContactId: contact_id,
                    Contact : contactobject || {},
                    LeadId: lead_id,
                    Lead: leadObject || {},
                    EmployeeId: entity.employee_id,
                    IsActive:entity.active,
                    //Employee: currentUser,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
 
                return obj;
            },
            toModelUpdate:function()
            {
                  var entity = this;
                  var obj = {
                    TaskId: entity.task_id,
                    Name: entity.name,
                    Reminder: entity.reminder,
                    Duedate: entity.dueDate,
                    Duedatetime: entity.dueDateTime,
                    Completedon: entity.completedOn,
                    Completedondate:entity.completedOnDate,
                    ContactId: entity.contact_id,
                    //Contact : contactobject || {},
                    LeadId: entity.lead_id,
                    //Lead: leadObject || {},
                    EmployeeId: entity.employee_id,
                    IsActive:entity.active,
                    //Employee: currentUser,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                 };
                 
                return obj;


            }
        },freezeTableName: true,
    });
    return Task;
};
