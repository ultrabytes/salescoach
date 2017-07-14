"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Target_selection_type = sequelize.define('target_selection_type', {
        target_selection_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,        
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        //active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj = {                 
                    TargetSelectionTypeId: this.target_selection_id,
                    //AccountId: this.account_id,
                    Name: this.name,                    
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Target_selection_type;
};

