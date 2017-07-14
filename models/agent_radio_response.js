"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var agent_radio_response = sequelize.define('agent_radio_response', {
        radio_response_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        radio_ans: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        is_milestone_defined: DataTypes.INTEGER,
        is_milestone_mandatory: DataTypes.INTEGER,
        initial_create:DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT


    },{
        instanceMethods: {
            toModel: function() {
                var obj = {
                    RadioResponseId: this.radio_response_id,
                    RadioAns: this.radio_ans,
                    IsMilestoneDefined: this.is_milestone_defined,
                    IsMilestoneMandatory: this.is_milestone_mandatory,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return agent_radio_response;
};

