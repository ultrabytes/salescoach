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
                    IsCurrent:true,
                    name: 'Contacted'
                }
            }]
        }]
    })
        .then(function(employee) {
            if(!employee)
                return callback(null, 0);

            var sum = 0;
            employee.Leads.forEach(function(item) {
                sum = sum + parseFloat(item.amount);
            });

            callback(null, sum);
        })
        .catch(function(err){
            callback(err);
        });
};