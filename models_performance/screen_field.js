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
        screen_display_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        status:DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
       // active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    ScreenFieldId: this.screen_field_id,
                    ScreenDisplayId: this.screen_display_id,
                    Name: this.name,
                    Status: this.status,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Screen_field;
};

