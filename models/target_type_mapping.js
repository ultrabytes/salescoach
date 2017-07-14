"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Target_type_mapping = sequelize.define('target_type_mapping', {
        map_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        target_selection_id: DataTypes.INTEGER,
        target_selection_sub_id: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        //active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    RoleId: this.role_id,
                    TargetSelectionId: this.target_selection_id,
                    TargetSelectionSubId: this.target_selection_sub_id,
                    Status: this.status,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Target_type_mapping;
};

