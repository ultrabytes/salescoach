"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var metric_role_response = sequelize.define('metric_role_response', {
        metric_role_mapping_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        role_id : DataTypes.INTEGER,
        metric_category_id: DataTypes.INTEGER,
        metric_id: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
        target_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        lead_indicator_frequency: DataTypes.STRING,
        positive_message: DataTypes.STRING,
        negative_message: DataTypes.STRING,
        lead_indicator: DataTypes.INTEGER
    }, {
        instanceMethods: {
            toModel: function () {
                var metric_role_response = {
                    MetricRoleMapping_id: this.metric_role_mapping_id,
                    RoleId: this.role_id,
                    MetricCategoryId:this.metric_category_id,
                    MetricId: this.metric_id,
                    Status: this.status,
                    Active: this.active,
                    TargetId: this.target_id,
                    LeadIndicatorFrequency: this.lead_indicator_frequency,
                    PositiveMessage: this.positive_message,
                    NegativeMessage: this.negative_message,
                    LeadIndicator: this.lead_indicator,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
    
                };
                return metric_role_response;
            }
        }, freezeTableName: true,
    });
    
    return metric_role_response;
};