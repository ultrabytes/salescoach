"use strict";
module.exports = function (sequelize, DataTypes) {
    var lead_stage_settings = sequelize.define('lead_stage_settings', {
        lead_stage_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id : DataTypes.INTEGER,
        name:DataTypes.STRING,
        average_days:DataTypes.INTEGER,
        position_level: DataTypes.INTEGER,
        probability: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        extra: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT
        
    }, {
        instanceMethods: {
            toModel: function () {
                var leadStageSettings = {
                    LeadStageId: this.lead_stage_id,
                    AccountId: this.account_id,
                    Name: this.name,
                    AverageDays: this.average_days,
                    PositionLevel: this.position_level,
                    Probability: this.probability,
                    Type: this.type,
                    Status: this.status,
                    Extra: this.extra,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return leadStageSettings;
            }
        }, freezeTableName: true,
    });
    
    return lead_stage_settings;
};