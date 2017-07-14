var db = require('../../../../models');

exports.calculate = function(employeeId, startDate, endDate, options, callback){
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
            }
        }]
    })
        .then(function(employee) {
            if(!employee)
                return callback(null, 0);

            var count = employee.Meetings.length;

            callback(null, count);
        })
        .catch(function(err){
            callback(err);
        });
};