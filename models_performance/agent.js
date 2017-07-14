"use strict";
module.exports = function(sequelize , DataTypes){
    var Agents = sequelize.define('agent', {
        agent_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        phone_number: DataTypes.STRING,
        email: DataTypes.STRING,
        address: DataTypes.STRING,
        age_group: DataTypes.STRING,
        date_of_birth:DataTypes.BIGINT,
        income: DataTypes.DECIMAL,
        experience: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        prospects_date: DataTypes.BIGINT,
        contacted_date: DataTypes.BIGINT,
        interviewed_date: DataTypes.BIGINT,
        selected_date: DataTypes.BIGINT,
        expectedClouserDate:DataTypes.BIGINT,
        trained_date: DataTypes.BIGINT,
        currentState: DataTypes.INTEGER,
        organisationName: DataTypes.STRING,
        rejectionReason: DataTypes.STRING,
        notInterestedReason: DataTypes.STRING,
        keyMilestone1: DataTypes.INTEGER,
        keyMilestone2: DataTypes.INTEGER,
        keyMilestone3: DataTypes.INTEGER,
        keyMilestone4: DataTypes.INTEGER,
        keyMilestone5: DataTypes.INTEGER,
        keyMilestone6: DataTypes.INTEGER,
        employee_id:DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        agent_stage_id: DataTypes.INTEGER,
        active:DataTypes.BOOLEAN
        
    },{
        instanceMethods: {             
            toModel: function (currentUser,IsReassigned) {
                var entity = this;
                 if(!IsReassigned)
                {
                    var IsReassigned = 0;
                }
                var obj = {                                                       
                AgentId:entity.agent_id,
                Name: entity.name,
                PhoneNumber: entity.phone_number,
                Email: entity.email,
                Address: entity.address,
                AgeGroup: entity.age_group,
                DateOfBirth:entity.date_of_birth,
                Income: entity.income,
                Experience: entity.experience,
                Status: entity.status,
                ProspectsDate: entity.prospects_date,
                ContactedDate: entity.contacted_date,
                InterviewedDate: entity.interviewed_date,
                SelectedDate: entity.selected_date,
                ExpectedClosureDate: entity.expectedClouserDate,
                TrainedDate: entity.trained_date,
                Currentstate: entity.currentState,
                Organizationname: entity.organisationName,
                RejectionReason: entity.rejectionReason,
                Notinterestedreason: entity.notInterestedReason,
                Keymilestone1: entity.keyMilestone1,
                Keymilestone2: entity.keyMilestone2,
                Keymilestone3: entity.keyMilestone3,
                Keymilestone4: entity.keyMilestone4,
                Keymilestone5: entity.keyMilestone5,
                Keymilestone6: entity.keyMilestone6,
                AgentStageId: entity.agent_stage_id,
                EmployeeId:entity.employee_id,
                IsReassigned: IsReassigned,
               // Employee: currentUser || {},
                IsActive: entity.active,
                InitialCreate: entity.initial_create,
                LastUpdated: entity.last_updated
                };
 
                return obj;
            }
        },freezeTableName: true,
    });
    return Agents;
};
