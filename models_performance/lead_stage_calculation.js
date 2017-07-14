"use strict";
module.exports = function(sequelize , DataTypes){
    var lead_stage_calculation = sequelize.define('lead_stage_calculation', {
        stage_calculation_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        account_id: DataTypes.INTEGER,
        active: DataTypes.INTEGER,
        number_of_days: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        stage_name:DataTypes.STRING,
        status: DataTypes.INTEGER,
        start_date: DataTypes.BIGINT,
        end_date: DataTypes.BIGINT,
        initial_position_level: DataTypes.INTEGER,
        updated_position_level: DataTypes.INTEGER,
        stage_setting_id: DataTypes.INTEGER,
        lead_id: DataTypes.INTEGER,
        employee_id:DataTypes.INTEGER,
        
    },{
        instanceMethods: {             
            toModel: function () {
                var entity = this;
                
                var obj = {                                                       
                    StageCalculationId: entity.stage_calculation_id,
                    AccountId: entity.account_id,
                    Active: entity.active,
                    NumberOfDays: entity.number_of_days,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated,
                    StageName: entity.stage_name,
                    Status: entity.status,
                    StartDate: entity.start_date,
                    EndDate: entity.end_date,
                    InitialPositionLevel: entity.initial_position_level,
                    UpdatedPositionLevel: entity.updated_position_level,
                    StageSettingId: entity.stage_setting_id,
                    LeadId: entity.lead_id,
                    EmployeeId: entity.employee_id
                };
 
                return obj;
            }
        },freezeTableName: true,
    });
    return lead_stage_calculation;
};
