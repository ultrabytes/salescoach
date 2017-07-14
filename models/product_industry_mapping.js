"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Product_industry_mapping = sequelize.define('product_industry_mapping', {
        product_industry_mapping_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        industry_id: DataTypes.INTEGER,
        description: DataTypes.INTEGER,         
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
   
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {
                    ProductId: this.product_id,
                    IndustryId: this.industry_id,
                    Description: this.description,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Product_industry_mapping;
};
 