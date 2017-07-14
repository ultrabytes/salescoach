"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var SP_ROLUP_BRDGE_FACT = sequelize.define('SP_ROLUP_BRDGE_FACT', {
       
        account_id: DataTypes.INTEGER,
        employee_id : DataTypes.INTEGER,
        Report_Dt: {
              type: DataTypes.DATEONLY,
              get: function() {
                return moment.utc(this.getDataValue('Report_Dt')).format('YYYY-MM-DD');
              }
        },
        emp_position_level: DataTypes.INTEGER,
        mngr_emp_id: DataTypes.INTEGER,
        mngr_position_level: DataTypes.INTEGER,
        metric_id: DataTypes.BIGINT,
        TimeFrame: DataTypes.STRING,
        Amount: DataTypes.DECIMAL,
        cnt: DataTypes.BIGINT,
        target: DataTypes.DECIMAL,
        Change_PRCT: DataTypes.DECIMAL,
        DW_SESS_NM: DataTypes.STRING,
        DW_INS_UPD_DTS: {
            type: DataTypes.DATE,
              get: function() {
                return moment.utc(this.getDataValue('DW_INS_UPD_DTS')).format('YYYY-MM-DD HH:mm:ss');
              }
        }
    }, {
        instanceMethods: {
            toModel: function () {
                var SP_ROLUP_BRDGE_FACT = {
                  
                    EmployeeId: this.employee_id,
                    EmpPositionLevel: this.emp_position_level,
                    MngrEmpId: this.mngr_emp_id,
                    MngrPositionLevel: this.mngr_position_level,
                    ReportDate: this.Report_Dt,
                    MetricId:this.metric_id,
                    Timeframe: this.TimeFrame,
                    Amount: this.Amount,
                    Count: this.cnt,
                    Target: this.target,
                    ChangePercent: this.Change_PRCT,
                    DW_SESS_NM: this.DW_SESS_NM,
                    DW_INS_UPD_DTS: this.DW_INS_UPD_DTS
                    
    
                };
                return SP_ROLUP_BRDGE_FACT;
            }
        }, freezeTableName: true,
    });

     SP_ROLUP_BRDGE_FACT.removeAttribute("id");
    
    return SP_ROLUP_BRDGE_FACT;
};