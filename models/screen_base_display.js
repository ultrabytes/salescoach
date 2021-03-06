"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Screen_base_display = sequelize.define('screen_base_display', {
        screen_display_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        screen_module_id: DataTypes.INTEGER,
        name: DataTypes.STRING,       
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
       // active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenModuleId: this.screen_module_id,
                    PositionLevel: this.position_level,
                    Status: this.status,                    
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Screen_base_display;
};

