var async = require('async');
var db = require('../../../../models');

exports.calculate = function(employeeId, startDate, endDate, options, callback) {
    async.waterfall([
        function(cb) {
            db.Employee.find({
                where:{
                    id: employeeId
                },
                include:[{
                    model: db.Meeting,
                    where: {
                        scheduleDate: {
                            $gte: startDate,
                            $lte: endDate
                        },
                        $or: [
                            {purpose: 'Prospecting'},
                            {purpose: 'Understanding Requirements'}
                        ]
                    },
                    include: [{
                        model: db.MeetingType,
                        where: {
                            type: 'meeting'
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null, 0);

                var count = employee.Meetings.length;

                cb(null, count);
            })
            .catch(function(err){
                cb(err);
            });
        },
        function(Count, cb) {
            db.Employee.find({
                where:{
                    id: employeeId
                },
                include:[{
                    model: db.Meeting,
                    where: {
                        scheduleDate: {
                            $gte: startDate,
                            $lte: endDate
                        },
                        purpose: 'Prospecting'
                    },
                    include: [{
                        model: db.MeetingType,
                        where: {
                            type: 'call'
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null, Count, 0);

                var totalCount = employee.Meetings.length;

                cb(null, Count, totalCount);
            })
            .catch(function(err){
                cb(err);
            });
        }
    ], function(err, amount, totalCount) {
        if (err)
            return callback(err);
        var sum = totalCount/amount || 0;
        if(!isFinite(sum)){
            sum = 0;
        }
        callback(null, sum);
    });
};