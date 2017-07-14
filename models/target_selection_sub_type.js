"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Target_selection_sub_type = sequelize.define('target_selection_sub_type', {
        target_selection_sub_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        target_selection_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        target_assignment_for: DataTypes.INTEGER,
        description: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        //active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    TargetSelectionId: this.target_selection_id,
                    Name: this.name,
                    TargetAssignmentFor: this.target_assignment_for,
                    Description: this.description,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Target_selection_sub_type;
};

