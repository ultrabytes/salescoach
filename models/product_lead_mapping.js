"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var product_lead_mapping = sequelize.define('product_lead_mapping', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lead_id: DataTypes.INTEGER,
        product_code: DataTypes.INTEGER,
        unit: DataTypes.INTEGER,
        amount: DataTypes.DOUBLE,         
        product_name: DataTypes.STRING,
        employee_id: DataTypes.INTEGER,
        close_date: DataTypes.STRING,
        stage: DataTypes.STRING,
        sub_product_id: DataTypes.INTEGER,
        sub_product_name: DataTypes.STRING,
        commission_rate: DataTypes.STRING,
        account_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active:DataTypes.INTEGER
   
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {
                    Id: this.id,
                    LeadId: this.lead_id,
                    ProductCode: this.product_code,
                    Unit: this.unit,
                    Amount: this.amount,
                    ProductName: this.product_name,
                    EmployeeId: this.employee_id,
                    CloseDate: this.close_date,
                    Stage: this.stage,
                    SubProductId: this.sub_product_id,
                    SubProductName: this.sub_product_name,
                    CommissionRate: this.commission_rate,
                    //AccountId:this.account_id,
                    Active: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated

                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return product_lead_mapping;
};
 