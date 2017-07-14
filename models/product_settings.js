"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var product_settings = sequelize.define('product_settings', {
        product_setting_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        product_type: DataTypes.INTEGER,
        amount_as:DataTypes.INTEGER,
        tracked_as: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        resell:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated:DataTypes.BIGINT,
        active:DataTypes.INTEGER

    },{
        instanceMethods: {
            toModel: function() {
                var obj = { 
                    ProductSettingId : this.product_setting_id, 
                    //AccountId: this.account_id,              
                    ProductType: this.product_type,
                    AmountAs: this.amount_as,
                    TrackedAs: this.tracked_as,
                    Status: this.status,
                    Resell:this.resell,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                    
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return product_settings;
};
 