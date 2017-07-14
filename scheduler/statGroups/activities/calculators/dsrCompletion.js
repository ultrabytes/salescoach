var db = require('../../../../models');
var async = require('async');
var moment = require('moment');


exports.calculate = function(employeeId, startDate, endDate, options, callback){
    var result =[];
    var total = 0;
    var start = moment(startDate);
    var end = moment(endDate);
    var count =  start.diff(end) + 1;
    for(var i=0;i<count;i++)
        result.push(i);

    async.eachSeries(result, function(item, next){
        var startOfDate = moment(startDate).toDate();
        var endOfDate = moment(startDate).add(item + 1,'days').toDate();
        db.Employee.find({
            where:{
                id: employeeId
            },
            include:[{
                model: db.Meeting,
                where: {
                    scheduleDate: {
                        $gte: startOfDate,
                        $lte: endOfDate
                    }
                }
            }]
        })
            .then(function(employee) {
                if(!employee)
                    return next();

                var count = employee.Meetings.length;
                var reviewCount = 0;

                employee.Meetings.forEach(function(item){
                    reviewCount = reviewCount + item.reviewStatus;
                });
                if(count!=0 && reviewCount == count){
                    total =total +1;
                }

                next();
            })
            .catch(function(err){
                next(err);
            });
    }, function(err) {
        if (err)
            return callback(err);

        var sum = total/count;
        if(!isFinite(sum)){
            sum = 0;
        }
        callback(null, amount);

    });
};
