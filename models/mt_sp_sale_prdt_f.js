"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var mt_sp_sls_prdct_tgt_fact = sequelize.define('mt_sp_sls_prdct_tgt_fact', {
        account_id: DataTypes.INTEGER,
        employee_id : DataTypes.INTEGER,
        report_dt: {
              type: DataTypes.DATEONLY,
              get: function() {
                return moment.utc(this.getDataValue('Report_Dt')).format('YYYY-MM-DD');
              }
        },
        emp_position_level: DataTypes.INTEGER,
        mngr_emp_id: DataTypes.INTEGER,
        mngr_position_level: DataTypes.INTEGER,
        metric_category_id: DataTypes.STRING,
        metric_id: DataTypes.STRING,
        product_id: DataTypes.INTEGER,
        product_name: DataTypes.INTEGER,
        sp_sale_prdct_amount_DLY: DataTypes.DECIMAL,
        sp_sale_prdct_target_DLY: DataTypes.DECIMAL,
        sp_sale_prdct_amount_WKLY: DataTypes.DECIMAL,
        sp_sale_prdct_target_WKLY: DataTypes.DECIMAL,
        sp_sale_prdct_amount_MNTLY: DataTypes.DECIMAL,
        sp_sale_prdct_target_MNTLY: DataTypes.DECIMAL,
        sp_sale_prdct_amount_QTRLY: DataTypes.DECIMAL,
        sp_sale_prdct_target_QTRLY: DataTypes.DECIMAL,
        sp_sale_prdct_amount_YRLY:DataTypes.DECIMAL,
        sp_sale_prdct_target_YRLY: DataTypes.DECIMAL,
        DW_SESS_NM:DataTypes.STRING,
        DW_INS_UPD_DTS:{
              type: DataTypes.DATEONLY,
              get: function() {
                return moment.utc(this.getDataValue('DW_INS_UPD_DTS')).format('YYYY-MM-DD HH:mm:ss');
              }
        }
        
       
    }, {
        instanceMethods: {
            toModel: function () {
                var MT_SP_SLS_PRDCT_TGT_FACT = {
                    AccountId: this.account_id,
                    EmployeeId: this.employee_id,
                    ReportDate: this.report_dt,
                    EmpPositionLevel: this.emp_position_level,
                    MngrEmpId: this.mngr_emp_id,
                    MngrPositionLevel: this.mngr_position_level,
                    MetricCategory_id: this.metric_category_id,
                    MetricId: this.metric_id,
                    ProductId: this.product_id,
                    ProductName: this.product_name,
                    SpSalePrdctAmount_DLY: this.sp_sale_prdct_amount_DLY,
                    SpSalePrdctTarget_DLY:this.sp_sale_prdct_target_DLY,
                    SpSalePrdctAmount_WKLY:this.sp_sale_prdct_amount_WKLY,
                    SpSalePrdctTarget_WKLY: this.sp_sale_prdct_target_WKLY,
                    SpSalePrdctAmount_MNTLY: this.sp_sale_prdct_amount_MNTLY,
                    SpSalePrdctTarget_MNTLY: this.sp_sale_prdct_target_MNTLY,
                    SpSalePrdctAmount_QTRLY: this.sp_sale_prdct_amount_QTRLY,
                    SpSalePrdctTarget_QTRLY: this.sp_sale_prdct_target_QTRLY,
                    SpSalePrdctAmount_YRLY: this.sp_sale_prdct_amount_YRLY,
                    SpSalePrdctTarget_YRLY: this.sp_sale_prdct_target_YRLY,
                    DW_SESS_NM: this.DW_SESS_NM,
                    DW_INS_UPD_DTS: this.DW_INS_UPD_DT
    
                };
                return mt_sp_sls_prdct_tgt_fact;
            }
        }, freezeTableName: true,
    });
    
    return mt_sp_sls_prdct_tgt_fact;
};