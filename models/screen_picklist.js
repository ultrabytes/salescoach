"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Screen_picklist = sequelize.define('screen_picklist', {
        screen_picklist_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        screen_field_id: DataTypes.INTEGER,
        screen_picklist_master_id: DataTypes.INTEGER,
        position_level: DataTypes.INTEGER,
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenPicklistId: this.screen_picklist_id,
                    Name: this.name,
                    ScreenFieldId: this.screen_field_id,
                    ScreenPicklistMaster_id: this.screen_picklist_master_id,
                    PositionLevel: this.position_level,
                    Status: this.status,   
                    Active: this.active,                 
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Screen_picklist;
};

