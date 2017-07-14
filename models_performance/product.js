"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Product = sequelize.define('product', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        organization_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        product_name: DataTypes.STRING,
        unit_price: DataTypes.STRING,
        margin: DataTypes.STRING,
        description: DataTypes.STRING,
        product_resell: DataTypes.INTEGER,
        product_type: DataTypes.INTEGER,
        brand_name: DataTypes.STRING,
        track_as_separate_lead: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        //active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = { 
                    ProductId : this.product_id,               
                    OrganizationId: this.organization_id,
                    //AccountId: this.account_id,
                    ProductName: this.product_name,
                    UnitPrice: this.unit_price,
                    Margin: this.margin,
                    Description: this.description,
                    ProductResell: this.product_resell,
                    ProductType: this.product_type,
                    BrandName: this.brand_name,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,
                    TrackAsSeparateLead: this.track_as_separate_lead
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Product;
};
 