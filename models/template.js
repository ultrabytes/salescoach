"use strict";
module.exports = function (sequelize, DataTypes) {
    var template = sequelize.define('template', {
        template_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        device: DataTypes.STRING,
        type:DataTypes.STRING,
        metric_name: DataTypes.STRING,
        metric_value: DataTypes.INTEGER,
        metric_value_unit: DataTypes.INTEGER,
        metric_count: DataTypes.INTEGER,
        metric_count_unit: DataTypes.STRING,
        target: DataTypes.INTEGER,
        traffic_light: DataTypes.INTEGER,
        percent_change: DataTypes.INTEGER,
        active: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        is_bar_required: DataTypes.INTEGER,
        is_traffic_light_required: DataTypes.INTEGER,
        is_amount_required: DataTypes.INTEGER,
        is_change_required: DataTypes.INTEGER,
        is_deal_count_required: DataTypes.INTEGER,
        is_target_required: DataTypes.INTEGER,
        is_product_name_required: DataTypes.INTEGER,
        is_percentage_required: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER
       
    }, {
        instanceMethods: {
            toModel: function () {
                var template = {
                    TemplateId: this.template_id,
                    Name: this.name,
                    Device:this.device,
                    Type: this.type,
                    MetricName: this.metric_name,
                    MetricValue: this.metric_value,
                    MetricValueUnit: this.metric_value_unit,
                    MetricCount: this.metric_count,
                    MetricCountUnit: this.metric_count_unit,
                    Target: this.target,
                    TrafficLight: this.traffic_light,
                    PercentChange: this.percent_change,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,
                    Active: this.active,
                    IsBarRequired: this.is_bar_required,
                    IsTrafficLightRequired: this.is_traffic_light_required,
                    IsAmountRequired: this.is_amount_required,
                    IsChangeRequired: this.is_change_required,
                    IsDealCountRequired: this.is_deal_count_required,
                    IsTargetRequired: this.is_target_required,
                    IsProductNameRequired: this.is_product_name_required,
                    IsPercentageRequired: this.is_percentage_required
                };
                return template;
            }
        }, freezeTableName: true,
    });
    
    return template;
};