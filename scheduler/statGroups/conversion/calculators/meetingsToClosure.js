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

                var count =employee.Leads.length;

                cb(null, count);
            })
            .catch(function(err){
                cb(err);
            });
        },
        function(count, cb) {
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
                    return cb(null, count, 0);

                var totalCount = employee.Meetings.length;

                cb(null, count, totalCount);
            })
            .catch(function(err){
                cb(err);
            });
        }
    ], function(err, amount, totalCount) {
        if (err)
            return callback(err);

        var sum = amount/totalCount || 0;
        if(!isFinite(sum)){
            sum = 0;
        }

        callback(null, sum);
    });
};