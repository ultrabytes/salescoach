var async = require('async');
var db = require('../models');
var repository = require('./repository');

exports.executeProcessor = function(employeeIds, startDate, endDate, config, callback) {

    var statGroups = ['activities','productivity','productProductivity','conversion','leadGeneration','pipeline','productLeadGeneration','productPipeline']; //group name

    async.eachSeries(statGroups, function(statGroup, statGroupCallback) {
        async.waterfall([
            function(cb) {
                db.Statistic.findAll({
                    where: {
                        statsGroup: statGroup
                    }
                }).then(function(stats) {
                    // console.log("Status are-->"+Json.stringify(stats));
                    
                    if(stats.length == 0)
                        return cb('Not find Relative Stats');
                    cb(null, stats);
                }).catch(function (err) {
                    cb(err);
                })
            },
            function(stats ,cb) {
                var processor = require('./statGroups/'+statGroup+'/processor');
                processor.process(statGroup, stats, employeeIds, startDate, endDate, function(err, data) {
                    if(err) return cb(err);
                    cb(null, data);
                })
            },
            function(data, cb) {
                console.log(data);
                repository.save(data, config, function(err){
                    cb(err);
                })
            }
        ], function(err) {
            if(err) return statGroupCallback(err);
            statGroupCallback();
        });
    }, function(err) {
        callback(err);
    });
};