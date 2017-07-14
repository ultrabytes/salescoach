"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Screen_module = sequelize.define('screen_module', {
        screen_module_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        screen_module_master_id: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
        IsMandatory: DataTypes.BOOLEAN,
        module_seq_no: DataTypes.INTEGER,
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
       // active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenModuleId: this.screen_module_id,
                    //AccountId: this.account_id,
                    Name: this.name,
                    ScreenModuleMasterId: this.screen_module_master_id,
                    Active: this.active,
                    ModuleSeqNo: this.module_seq_no,
                    Status: this.status,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Screen_module;
};

