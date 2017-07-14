"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Screen_field = sequelize.define('screen_field', {
        screen_field_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        screen_field_master_id: DataTypes.INTEGER,
        screen_module_id: DataTypes.INTEGER,
        screen_display_id: DataTypes.INTEGER,
        IsMandatory: DataTypes.INTEGER,
        IsDeletable: DataTypes.INTEGER,
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.INTEGER
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenFieldId: this.screen_field_id,
                    //AccountId: this.account_id,
                    Name: this.name,
                    ScreenFieldMasterId: this.screen_field_master_id,
                    ScreenModuleId: this.screen_module_id,
                    ScreenDisplayId: this.screen_display_id,
                    IsMandatory: this.IsMandatory,
                    IsDeletable: this.IsDeletable,
                    Status: this.status,
                    Active: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Screen_field;
};

