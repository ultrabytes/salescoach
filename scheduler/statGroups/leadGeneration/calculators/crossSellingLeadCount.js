var async = require('async');
var db = require('../../../../models');

exports.calculate = function(employeeId, startDate, endDate, options, callback){
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
                            name: 'Prospects'
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null, []);

                    cb(null, employee.Leads);
            })
            .catch(function(err){
                cb(err);
            });
        },
        function(employeeLeads, cb) {
            var count = 0;
            async.eachSeries(employeeLeads, function(lead, next) {
                    db.Lead.findAndCountAll({
                        where: {
                            ContactId: lead.ContactId
                        },
                        include: [{
                            model:db.State,
                            where: {
                                name: 'Won',
                                IsCurrent: 1
                            }
                        }]
                    }).then(function (cs) {
                        count =count + cs.count;
                        next();
                    }).catch(function(err) {
                        next(err);
                    })
            }, function(err) {
                if (err)
                   return cb(err);

                cb(null, count);
            })
        }
    ], function(err, total) {
        if (err)
            return callback(err);

        callback(null, total);
    });
};