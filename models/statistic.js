"use strict";
module.exports = function (sequelize, DataTypes) {
    var Statistic = sequelize.define('Statistic', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: DataTypes.STRING,
        statsGroup: DataTypes.STRING,
        dailyTarget: DataTypes.INTEGER,
        weekTarget: DataTypes.INTEGER,
        monthTarget: DataTypes.INTEGER,
        quarterTarget: DataTypes.INTEGER,
        yearTarget: DataTypes.INTEGER
    },{
        instanceMethods: {

        }
    });
    return Statistic;
};