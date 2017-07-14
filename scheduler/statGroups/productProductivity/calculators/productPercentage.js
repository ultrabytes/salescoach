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
                            name: 'Won'
                        }
                    }, {
                        model: db.Product,
                        where: {
                            id: options.productId
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null, 0);

                var amount = 0;

                employee.Leads.forEach(function(item) {
                    amount = amount + parseFloat(item.amount);
                });

                cb(null, amount);
            })
            .catch(function(err){
                cb(err);
            });
        },
        function(productSum, cb) {
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
                            name: 'Won'
                        }
                    }]
                }]
            })
            .then(function(employee) {
                if(!employee)
                    return cb(null, productSum, 0);

                var amount = 0;
                employee.Leads.forEach(function(item) {
                    amount = amount + parseFloat(item.amount);
                });

                cb(null, productSum, amount);
            })
            .catch(function(err){
                cb(err);
            });
        }
    ],function(err, productSum, total) {
        if(err) return callback(err);

        var amount = (productSum/total)*100 || 0;
        if(!isFinite(amount)){
            amount = 0;
        }

        callback(null, amount);
    });
};
