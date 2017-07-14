"use strict";
module.exports = function (sequelize, DataTypes) {
    var sp_rolup_brdge_fact = sequelize.define('sp_rolup_brdge_fact', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        employee_id : DataTypes.INTEGER,
        Report_Dt: DataTypes.BIGINT,
        reporting_person: DataTypes.INTEGER,
        Metric_Id: DataTypes.BIGINT,
        TimeFrame: DataTypes.STRING,
        Amount: DataTypes.DECIMAL,
        Cnt: DataTypes.BIGINT,
        Target: DataTypes.DECIMAL,
        Change_PRCT: DataTypes.DECIMAL,
        target_single_id: DataTypes.BIGINT,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT
    }, {
        instanceMethods: {
            toModel: function () {
                var sp_rolup_brdge_fact = {
                    Id: this.id,
                    EmployeeId: this.employee_id,
                    ReportDate: this.Report_Dt,
                    ReportingPerson: this.reporting_person,
                    MetricId:this.Metric_Id,
                    Timeframe: this.TimeFrame,
                    Amount: this.Amount,
                    Count: this.Cnt,
                    Target: this.Target,
                    ChangePercent: this.Change_PRCT,
                    TargetSingleId:this.target_single_id,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
    
                };
                return sp_rolup_brdge_fact;
            }
        }, freezeTableName: true,
    });
    
    return sp_rolup_brdge_fact;
};