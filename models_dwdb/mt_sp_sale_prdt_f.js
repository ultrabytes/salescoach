"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var SP_SLS_PRDCT_AGGR_FACT = sequelize.define('SP_SLS_PRDCT_AGGR_FACT', {
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
        Metric_Id: DataTypes.BIGINT,
        TimeFrame: DataTypes.STRING,
        product_Id: DataTypes.BIGINT,
        product_name: DataTypes.STRING,
        Amount: DataTypes.DECIMAL,
        target: DataTypes.DECIMAL,
        Cnt:DataTypes.INTEGER,
        Share_PRCT: DataTypes.DECIMAL,
        Change_PRCT: DataTypes.DECIMAL,
        DW_SESS_NM: DataTypes.STRING,
        DW_INS_UPD_DTS: {
            type: DataTypes.DATEONLY,
              get: function() {
                return moment.utc(this.getDataValue('DW_INS_UPD_DTS')).format('YYYY-MM-DD HH:mm:ss');
              }
        }
       
       
    }, {
        instanceMethods: {
            toModel: function () {
                var SP_SLS_PRDCT_AGGR_FACT = {
                    Id: this.id,
                    AccountId: this.account_id,
                    EmployeeId: this.employee_id,
                    ReportDate: this.Report_Dt,
                    MetricId: this.Metric_Id,
                    TimeFrame: this.TimeFrame,
                    ProductId: this.product_Id,
                    ProductName: this.product_name,
                    Amount: this.Amount,
                    Target: this.target,
                    Count:this.Cnt,
                    SharePRCT: this.Share_PRCT,
                    ChangePRCT: this.Change_PRCT,
                    DW_SESS_NM: this.DW_SESS_NM,
                    DW_INS_UPD_DTS: this.DW_INS_UPD_DTS

                   
    
                };
                return SP_SLS_PRDCT_AGGR_FACT;
            }
        }, freezeTableName: true,
    });

   // SP_SLS_PRDCT_AGGR_FACT.removeAttribute("id");
    
    return SP_SLS_PRDCT_AGGR_FACT;
};