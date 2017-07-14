"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var agent_stage_settings = sequelize.define('agent_stage_settings', {
        agent_stage_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        NAME: DataTypes.STRING,
        POSITION: DataTypes.STRING,
        PROBABILITY: DataTypes.DECIMAL,
        average_days: DataTypes.INTEGER,
        TYPE: DataTypes.STRING, 
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        ACTIVE: DataTypes.INTEGER,
        milestone_id:DataTypes.INTEGER
       
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    AgentStageId: this.agent_stage_id,
                    //AccountId: this.account_id,
                    Name: this.NAME,
                    PositionLevel: this.POSITION,
                    Probability: this.PROBABILITY,
                    AverageDays: this.average_days,
                    Type: this.TYPE,
                    MileStoneId: this.milestone_id,
                    Status:this.ACTIVE,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return agent_stage_settings;
};

