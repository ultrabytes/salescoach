"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var DEAL_RISK_FACT = sequelize.define('DEAL_RISK_FACT', {
        Account_ID: {
            type: DataTypes.INTEGER,
        },
        employee_id : DataTypes.INTEGER,
        lead_id: DataTypes.INTEGER,
        DEAL_RISK_FLG: DataTypes.STRING,
        DEAL_RISK_DTL_DESC: DataTypes.STRING,
        DEAL_RISK_RECOMMEND_TTL_DESC:DataTypes.STRING,
        DEAL_RISK_RECOMMEND_DTL_DESC: DataTypes.STRING,
        DW_SESSION_NM:DataTypes.STRING,
        DW_INS_UPD_DTS:{
            type:DataTypes.DATE,
            get: function() {
                //return moment(this.getDataValue('DW_INS_UPD_DTS')).format('x');
               // return moment(this.getDataValue('DW_INS_UPD_DTS'),"YYYY-MM-DDTHH:mm:ss").format("x");
               return this.getDataValue('DW_INS_UPD_DTS');
            }
        },
        SOURCE_BACK_PULL_ID: DataTypes.BIGINT


    }, {
        instanceMethods: {
            toModel: function () {
                var DEAL_RISK_FACT = {

                    AccountId: this.Account_ID,
                    EmployeeId: this.employee_id,
                    LeadId: this.lead_id,
                    DealRiskFlag: this.DEAL_RISK_FLG,
                    DealRiskDtlDesc: this.DEAL_RISK_DTL_DESC,
                    DealRiskRecommendTtlDesc:this.DEAL_RISK_RECOMMEND_TTL_DESC,
                    DealRiskRecommendDtlDesc: this.DEAL_RISK_RECOMMEND_DTL_DESC,
                    DwSessionNm: this.DW_SESSION_NM,
                    DwInsUpdDts: this.DW_INS_UPD_DTS,
                    SourceBackPullId:this.SOURCE_BACK_PULL_ID



                };
                return DEAL_RISK_FACT;
            }
        }, freezeTableName: true,
    });

    DEAL_RISK_FACT.removeAttribute("id");



    return DEAL_RISK_FACT;
};