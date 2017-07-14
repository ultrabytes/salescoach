"use strict";
module.exports = function (sequelize, DataTypes) {
    var lead_status_setting = sequelize.define('lead_status_setting', {
        lead_status_setting_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lead_status_mst_id:DataTypes.INTEGER,
        account_id : DataTypes.INTEGER,
        name:DataTypes.STRING,
        average_days:DataTypes.INTEGER,
        positional_level: DataTypes.INTEGER,
        probability: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        extra: DataTypes.STRING,
        active: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT

    }, {
        instanceMethods: {
            toModel: function () {
                var lead_status_setting = {
                    LeadStatusSettingId: this.lead_status_setting_id,
                    LeadStatusMstId: this.lead_status_mst_id,
                    AccountId: this.account_id,
                    Name: this.name,
                    AverageDays: this.average_days,
                    PositionalLevel: this.positional_level,
                    Probability: this.probability,
                    Type: this.type,
                    Status: this.status,
                    Extra: this.extra,
                    Active: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return lead_status_setting;
            }
        }, freezeTableName: true,
    });

    return lead_status_setting;
};