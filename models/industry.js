"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Industry = sequelize.define('industry', {
        industry_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        short_name: DataTypes.STRING,
        type: DataTypes.INTEGER,
        parent: DataTypes.INTEGER,
        initial_create:DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj ={
                    IndustryId: this.industry_id,
                    Name: this.name,
                    ShortName: this.short_name,
                    Type: this.type,
                    Parent: this.parent,
                    IsActive: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            },
            json: function() {
                var obj ={
                    IndustryId: this.industry_id,
                    Name: this.name,
                    ShortName: this.short_name,
                    Type: this.type,
                    Parent: this.parent,
                    IsActive: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Industry;
};

