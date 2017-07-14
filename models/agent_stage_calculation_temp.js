"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var agent_stage_calculation_temp = sequelize.define('agent_stage_calculation_temp', {
        stage_calculation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        stage_name: DataTypes.STRING,
        stage_setting_id: DataTypes.INTEGER,
        start_date: DataTypes.BIGINT,
        end_date: DataTypes.BIGINT,
        number_of_days: DataTypes.INTEGER,
        initial_position_level: DataTypes.INTEGER,
        updated_position_level: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        extra: DataTypes.STRING,
        agent_id:DataTypes.INTEGER,
        initial_create:DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        key_title: DataTypes.STRING,
        key_date:DataTypes.BIGINT,
        active: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER

    },{
        instanceMethods: {
            toModel: function() {
                var obj = {
                    StageCalculationId: this.stage_calculation_id,
                    //AccountId: this.account_id,
                    StageName: this.stage_name,
                    EmployeeId: this.employee_id,
                    StageSettingId: this.stage_setting_id,
                    StartDate: this.start_date,
                    EndDate: this.end_date,
                    NumberOfDays: this.number_of_days,
                    InitialPositionLevel: this.initial_position_level,
                    UpdatedPositionLevel: this.updated_position_level,
                    Status: this.status,
                    Active: this.active,
                    Extra: this.extra,
                    AgentId: this.agent_id,
                    InitialCreate:this.initial_create,
                    LastUpdated: this.last_updated,
                    KeyTitle: this.key_title,
                    KeyDate: this.key_date
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return agent_stage_calculation_temp;
};

