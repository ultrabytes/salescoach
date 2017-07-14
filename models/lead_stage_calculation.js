"use strict";
module.exports = function(sequelize , DataTypes){
    var lead_stage_calculation = sequelize.define('lead_stage_calculation', {
        stage_calculation_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        //local_id: DataTypes.BIGINT,
        employee_id:DataTypes.INTEGER,
        
    },{
        instanceMethods: {             
            toModel: function () {
                var entity = this;
                
                var obj = {                                                       
                    StageCalculationId: entity.stage_calculation_id,
                   // AccountId: entity.account_id,
                    //Active: entity.active,
                    EmployeeId: entity.employee_id,
                    StageName: entity.stage_name,
                    StageSettingId: entity.stage_setting_id,
                    StartDate: entity.start_date,
                    EndDate: entity.end_date,
                    NumberOfDays: entity.number_of_days,
                    InitialPositionLevel: entity.initial_position_level,
                    UpdatedPositionLevel: entity.updated_position_level,
                    Status: entity.status,
                    LeadId: entity.lead_id,
                    Active: entity.active,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated,

                    
                    
                    
                    //EmployeeId: entity.employee_id
                };
 
                return obj;
            }
        },freezeTableName: true,
    });
    return lead_stage_calculation;
};
