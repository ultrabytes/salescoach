"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var milestone = sequelize.define('milestone', {
        milestone_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        milestone: DataTypes.STRING,
        account_id: DataTypes.INTEGER,
        agent_stage_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.INTEGER
       
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    MilestoneId: this.milestone_id,
                    //AccountId: this.account_id,
                    Milestone: this.milestone,
                    AgentStageId: this.agent_stage_id,

                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return milestone;
};

