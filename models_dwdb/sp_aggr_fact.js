"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var SP_AGGR_FACT = sequelize.define('SP_AGGR_FACT', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Report_Dt: {
              type: DataTypes.DATEONLY,
              get: function() {
                return moment.utc(this.getDataValue('Report_Dt')).format('YYYY-MM-DD');
              }
        },
        account_id: DataTypes.INTEGER,
        employee_id : DataTypes.INTEGER,
        metric_id: DataTypes.BIGINT,
        TimeFrame: DataTypes.STRING,
        Amount: DataTypes.DECIMAL,
        cnt: DataTypes.BIGINT,
        PRCT:DataTypes.DECIMAL,
        target: DataTypes.DECIMAL,
        Change_PRCT: DataTypes.DECIMAL,
        DW_SESSION_NM: DataTypes.STRING,
        DW_INS_UPD_DTS: {
            type: DataTypes.DATE,
              get: function() {
                return moment.utc(this.getDataValue('DW_INS_UPD_DTS')).format('YYYY-MM-DD HH:mm:ss');
              }
        }
    }, {
        instanceMethods: {
            toModel: function () {
                var SP_AGGR_FACT = {
                  
                    EmployeeId: this.employee_id,
                    ReportDate: this.Report_Dt,
                    MetricId:this.metric_id,
                    Timeframe: this.TimeFrame,
                    Amount: this.Amount,
                    Count: this.cnt,
                    Percentage: this.PRCT,
                    Target: this.target,
                    ChangePercent: this.Change_PRCT,
                    DW_SESSION_NM: this.DW_SESSION_NM,
                    DW_INS_UPD_DTS: this.DW_INS_UPD_DTS
                    
    
                };
                return SP_AGGR_FACT;
            }
        }, freezeTableName: true,
    });

     
    
    return SP_AGGR_FACT;
};