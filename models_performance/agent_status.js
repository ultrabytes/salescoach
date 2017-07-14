"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Agent_status = sequelize.define('agent_status', {
        agent_status_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        position: DataTypes.STRING,
        type: DataTypes.STRING, 
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    AgentStatusId: this.agent_status_id,
                    //AccountId: this.account_id,
                    Name: this.name,
                    Position: this.position,
                    Type: this.type,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Agent_status;
};

