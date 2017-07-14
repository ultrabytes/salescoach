var async = require('async');
var _ = require('underscore');
var db = require('../models');


exports.save = function(arrayOfStat, config, cb) {
   async.eachSeries(arrayOfStat.stats, function(employeeStatistics, outer) {
        async.eachSeries(employeeStatistics.stats, function(stat, inner) {
            async.waterfall([
                function(wcb) {
                    db.Statistic.find({
                        where: {
                            key: stat.name,
                            statsGroup:arrayOfStat.group
                        },
                        attributes: ['id']
                    }).then(function(statisticDetails) {
                        wcb(null,statisticDetails);
                    }).catch(wcb);
                },
                function(statisticDetails, cb) {
                    var data = {
                        employeeId: employeeStatistics.employeeId,
                        statisticId: statisticDetails.id,
                        period: config.period,
                        date: config.startDate,
                        value: stat.value,
                        productId: stat.productId || null
                    };
                    db.Performance.addOrUpdateRecord(data, function(err){
                        cb(err);
                    })
                }
            ],function(err) {
                inner(err);
            });
        }, function(err) {
            outer(err);
        })
   }, function (err) {
       cb(err);
   });
};