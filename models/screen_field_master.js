"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var screen_field_master = sequelize.define('screen_field_master', {
        screen_field_master_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        screen_module_master_id: DataTypes.INTEGER,
        IsDeletable: DataTypes.INTEGER,
        IsMandatory: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        intial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
       // active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenFieldMasterId: this.screen_field_master_id,
                    //AccountId: this.account_id,
                    Name: this.name,
                    ScreenModuleMasterId: this.screen_module_master_id,
                    IsDeletable: this.IsDeletable,
                    IsMandatory: this.IsMandatory,
                    Status: this.status,
                    InitialCreate: this.intial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return screen_field_master;
};

