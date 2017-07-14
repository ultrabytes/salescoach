"use strict";
module.exports = function (sequelize, DataTypes) {
    var contact_log = sequelize.define('contact_log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        contact_id : DataTypes.INTEGER,
        old_employee_id: DataTypes.INTEGER,
        new_employee_id: DataTypes.INTEGER,
        assigned_by_id : DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
       
    }, {
        instanceMethods: {
            toModel: function () {
                var contact_log = {
                    Id: this.id,
                    ContactId: this.contact_id,
                    OldEmployeeId: this.old_employee_id,
                    NewEmployeeId: this.new_employee_id,
                    AssignedById: this.assigned_by_id,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                  
                };
                return contact_log;
            }
        }, freezeTableName: true,
    });
    
    return contact_log;
};