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
        screen_field_id: DataTypes.INTEGER,
        default_name: DataTypes.STRING,
        updated_name: DataTypes.STRING,
        position_level: DataTypes.INTEGER,
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenFieldId: this.screen_field_id,
                    DefaultName: this.default_name,
                    UpdatedName: this.updated_name,
                    PositionLevel: this.position_level,
                    Status: this.status,                    
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Screen_picklist;
};

