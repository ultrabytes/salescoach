"use strict";
module.exports = function(sequelize , DataTypes){
    var AccessLevel = sequelize.define('access_level',{
        access_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employee_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        description: DataTypes.STRING,
        accessible_role_ids:DataTypes.STRING,
        access_level: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function(currentUser){
                return {
                    AccessId: this.access_id,
                    EmployeeId: this.employee_id,
                    Description: this.description,
                    AccessRoleIds:this.accessible_role_ids,
                    // Employee: currentUser || { },
                    AccessLevel : this.access_level,
                    IsActive: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                }
            }
        },freezeTableName: true,
    });
    return AccessLevel;
};
