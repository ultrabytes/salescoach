var async = require('async');

exports.process = function(statTypeGroup, statTypes, employeeIds, startDate, endDate, callback){
    var result = {
        group: statTypeGroup,
        stats:[]
    };

    async.eachSeries(employeeIds, function(employeeId, outer) {
        var employeeStat = {
            employeeId: employeeId,
            stats: []
        };
        result.stats.push(employeeStat);

        async.eachSeries(statTypes, function(statType, inner) {

                var calculator = require('./calculators/' + statType.key); // " calculators/" + statType + ".js"

                calculator.calculate(employeeId, startDate, endDate, {}, function(err, value) {
                    if(err) return inner(err);
                    employeeStat.stats.push({
                        name : statType.key,
                        value : value
                    });
                    inner();
                });
            },
            function(err) {
                outer(err);
            })
    }, function(err) {
        if (err)  return callback(err);

        callback(null, result);
    });
};