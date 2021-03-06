"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var mt_sp_sale_prdt_f = sequelize.define('mt_sp_sale_prdt_f', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        employee_id : DataTypes.INTEGER,
        Report_Dt: {
              type: DataTypes.DATEONLY,
              get: function() {
                return moment.utc(this.getDataValue('Report_Dt')).format('YYYY-MM-DD');
              }
        },
        reporting_person: DataTypes.INTEGER,
        Metric_Id: DataTypes.BIGINT,
        TimeFrame: DataTypes.STRING,
        Amount: DataTypes.DECIMAL,
        Share_PRCT: DataTypes.DECIMAL,
        Change_PRCT: DataTypes.DECIMAL,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT
    }, {
        instanceMethods: {
            toModel: function () {
                var mt_sp_sale_prdt_f = {
                    Id: this.id,
                    EmployeeId: this.employee_id,
                    ReportDate: this.Report_Dt,
                    ReportingPerson: this.reporting_person,
                    MetricId:this.Metric_Id,
                    Timeframe: this.TimeFrame,
                    Amount: this.Amount,
                    SharePercent: this.Share_PRCT,
                    ChangePercent:this.Change_PRCT,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
    
                };
                return mt_sp_sale_prdt_f;
            }
        }, freezeTableName: true,
    });
    
    return mt_sp_sale_prdt_f;
};