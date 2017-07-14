"use strict";
module.exports = function (sequelize, DataTypes) {
    var new_referral_lead = sequelize.define('new_referral_lead', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employee_id: DataTypes.INTEGER,
        no_of_records: DataTypes.INTEGER,
        type: DataTypes.STRING,
        table_name: DataTypes.STRING,
        start_time: DataTypes.BIGINT,
        end_time: DataTypes.BIGINT,
        entry_on: DataTypes.BIGINT
    }, {
        instanceMethods: {
            toModel: function () {
                var n_r_lead = {
                    Id: this.id,
                    EmployeeId: this.employee_id,
                    NoOfRecords: this.no_of_records,
                    Type: this.type,
                    TableName:this.table_name,
                    StartTime: this.start_time,
                    EndTime: this.end_time,
                    EntryOn: this.entry_on,
    
                };
                return n_r_lead;
            }
        }, freezeTableName: true,
    });
    
    return new_referral_lead;
};