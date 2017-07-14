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
                    name: {
                        notIn: ['Won','Lost']
                    }
                }
            }]
        }]
    }).then(function(employee) {
        if(!employee)
            return callback(null, 0);

        var sum =0;
        employee.Leads.forEach(function(item) {
            sum = sum + parseFloat(item.amount);
        });

        var amount = sum/employee.Leads.length || 0;
        if(!isFinite(amount)){
            amount = 0;
        }

        callback(null, amount);
    }).catch(function(err){
        callback(err);
    });
};