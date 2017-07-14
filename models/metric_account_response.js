"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var metric_account_response = sequelize.define('metric_account_response', {
        metric_account_mapping_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        metric_id: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT
    }, {
        instanceMethods: {
            toModel: function () {
                var metric_account_response = {
                    MetricAccountMappingId: this.metric_account_mapping_id,
                    MetricId: this.metric_id,
                    Status: this.status,
                    Active: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
    
                };
                return metric_account_response;
            }
        }, freezeTableName: true,
    });
    
    return metric_account_response;
};