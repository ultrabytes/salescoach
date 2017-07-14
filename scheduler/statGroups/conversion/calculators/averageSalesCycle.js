var async = require('async');
var moment = require('moment');
var db = require('../../../../models');
var _ = require('underscore');

exports.calculate = function(employeeId, startDate, endDate, options, callback) {
    async.waterfall([
        function(cb) {
            db.Employee.find({
                where:{
                    id: employeeId
                },
                include:[{
                    model: db.Lead,
                    include:[{
                        model:db.State,
                        where: {
                            dateTime:{
                                $gte: startDate,
                                $lte: endDate
                            },
                            name: 'Won'
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null, 0);
                var sum = 0;
                employee.Leads.forEach(function(lead) {
                   var prospects = _.filter(lead.States, function(state) {
                       return state.name == "Prospects";
                   });
                   var won = _.filter(lead.States, function(state) {
                       return state.name == "Won";
                   });
                   var start = moment(prospects.dateTime);
                   var end = moment(won.dateTime);
                   var count = start.diff(end, 'days') + 1;
                   sum = sum + count;
                });

                cb(null, sum);
            })
            .catch(function(err){
                cb(err);
            });
        }
    ], function(err, amount) {
        if (err)
            return callback(err);

        var start = moment(startDate);
        var end = moment(endDate);
        var count = start.diff(end, 'days') + 1;

        var sum = amount/count || 0;
        if(!isFinite(sum)){
            sum = 0;
        }
        callback(null, sum);
    });
};