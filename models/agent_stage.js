"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Agent_stage = sequelize.define('agent_stage', {
        agent_stage_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        position: DataTypes.STRING,
        probability: DataTypes.STRING,
        average_days: DataTypes.STRING,
        type: DataTypes.STRING, 
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
       
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    AgentStageId: this.agent_stage_id,
                    //AccountId: this.account_id,
                    Name: this.name,
                    Position: this.position,
                    Probability: this.probability,
                    AverageDays: this.average_days,
                    Type: this.type,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Agent_stage;
};

