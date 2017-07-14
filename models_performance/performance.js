"use strict";
var async = require('async');
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var Performance = sequelize.define('Performance', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        period: DataTypes.STRING,
        value: DataTypes.STRING,
        date: DataTypes.DATE
    }, {
        instanceMethods: {
            toModel: function () {
                var entity = this;
                var model ={
                };
                model[entity.Statistic.key] = entity.value;
                model.statGroup = entity.Statistic.statsGroup;

                return model;
            }
        }
    },{
        classMethods: {
            addOrUpdateRecord: createOrUpdateStatistics
        }
    });
    return Performance;
};

var createOrUpdateStatistics = function(data, callback) {
    var db = require('./index');
    data.date =moment(data.date).format('YYYY-MM-DD 00:00:00');
    async.waterfall([
            function(wcb) {
                db.Performance.find({
                    where: {
                        date: data.date,
                        period: data.period,
                        ProductId: data.productId || null,
                        StatisticId: data.statisticId,
                        EmployeeId: data.employeeId
                    }
                }).then(function(performance) {
                    if(!performance)
                        return wcb(null);
                    performance.value = data.value;
                    performance.save(['value'])
                        .then(function(){
                            wcb(true);
                        }).catch(function(err){
                            wcb(err);
                        })
                })
            },
            function(wcb) {
                db.Performance.build({
                    value: data.value,
                    date: data.date,
                    period: data.period,
                    ProductId: data.productId || null,
                    StatisticId: data.statisticId,
                    EmployeeId: data.employeeId
                }).save().then(function(){
                    wcb(null)
                }).catch(function(err){
                    wcb(err);
                })
            }
        ],
        function(err) {
            if(typeof  err == 'boolean')
                return callback();
            callback(err)
        });
};