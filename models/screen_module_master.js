"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var screen_module_master = sequelize.define('screen_module_master', {
        screen_module_master_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        module_seq_no: DataTypes.INTEGER,
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
                    ScreenModuleMasterId: this.screen_module_master_id,
                    //AccountId: this.account_id,
                    Name: this.name,
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
    return screen_module_master;
};

