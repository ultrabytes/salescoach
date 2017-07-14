"use strict";
module.exports = function (sequelize, DataTypes) {
    var metric_category = sequelize.define('metric_category', {
        metric_category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        active: DataTypes.STRING,
        position_in_column: DataTypes.STRING,
        initial_create:DataTypes.INTEGER,
        last_updated: DataTypes.INTEGER,
        is_timer_required: DataTypes.INTEGER,
        global_metric_category_id: DataTypes.INTEGER
    }, {
        instanceMethods: {
            toModel: function () {
                var metric_category = {
                    MetricCategoryId: this.metric_category_id,
                    Name: this.name,
                    Active:this.active,
                    PositionInColumn: this.position_in_column,
                    IsTimerRequired: this.is_timer_required,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return metric_category;
            }
        }, freezeTableName: true,
    });
    
    return metric_category;
};