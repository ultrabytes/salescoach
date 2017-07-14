var db = require('../../../../models');

exports.calculate = function(employeeId, startDate, endDate, options, callback){
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
                return callback(null, 0);

            var count =employee.Leads.length;

            callback(null, count);
        })
        .catch(function(err){
            callback(err);
        });
};