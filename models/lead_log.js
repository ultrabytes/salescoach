"use strict";
module.exports = function (sequelize, DataTypes) {
    var lead_log = sequelize.define('lead_log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lead_id : DataTypes.INTEGER,
        old_employee_id: DataTypes.INTEGER,
        new_employee_id: DataTypes.INTEGER,
        assigned_by_id : DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
       
    }, {
        instanceMethods: {
            toModel: function (obContact) {
                var lead_log = {
                    Id: this.id,
                    LeadId: this.lead_id,
                    OldEmployeeId: this.old_employee_id,
                    NewEmployeeId: this.new_employee_id,
                    AssignedById: this.assigned_by_id,
                    Contact: obContact || null,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                  
                };
                return lead_log;
            }
        }, freezeTableName: true,
    });
    
    return lead_log;
};