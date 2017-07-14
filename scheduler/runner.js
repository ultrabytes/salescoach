var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var db = require('../models');
var processor = require('./processor');

exports.executeRunner = function(config, callback) {
    async.waterfall([
        function(cb) {

            db.employee
                .findAll({attributes: ['id']})
                .then(function(employees) {
                    if(employees.length == 0)
                        return cb('No Employee Find');
                    var employeeIds = employees.map(function(item){ return item.id; });

                    cb(null, employeeIds);
                }).catch(function(err){
                    cb(err);
                })
        },
        function(employeeIds, cb) {
            processor.executeProcessor(employeeIds, config.startDate, config.endDate, config , function(err) {
               cb(err);
            });
        }
    ], function(err) {
        callback(err);
    })
};