"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Screen_picklist = sequelize.define('screen_picklist_master', {
        screen_picklist_master_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        screen_field_master_id: DataTypes.INTEGER,
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenPicklistMasterId: this.screen_picklist_master_id,
                    Name: this.name,
                    ScreenFieldMasterId: this.screen_field_master_id,
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

