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
                            IsCurrent:true,
                            name:{
                                notIn:['Won','Lost']
                            }
                        }
                    }]
                }]
            })
                .then(function(employee) {
                    if(!employee)
                        return cb(null, 0);

                    var sum = 0;
                    employee.Leads.forEach(function(item) {
                        sum = sum + parseFloat(item.amount);
                    });

                    cb(null, sum);
                })
                .catch(function(err){
                    cb(err);
                });
        },
        function(total, cb) {
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
                            IsCurrent:true,
                            name: 'Contacted'
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null,total, 0);

                var sum = 0;
                employee.Leads.forEach(function(item) {
                    sum = sum + parseFloat(item.amount);
                });

                cb(null, total, sum);
            })
            .catch(function(err){
                cb(err);
            });
        },
    ], function(err, total, contact) {
        if (err)
            callback(err);

        var amount = (contact/total)*100 || 0;
        if(!isFinite(amount)){
            amount = 0;
        }

        callback(null, amount);
    });
};