var async = require('async');
var db = require('../../../models');

exports.process = function(statTypeGroup, statTypes, employeeIds, startDate, endDate,  callback) {
    async.waterfall([
        function (cb) {
            db.Product.findAll() // fetching the product from db
                .then(function(products) {
                    if(products.length == 0)
                        cb('No Product Exist');

                    cb(null, products);
                }).catch(function(err) {
                    cb(err);
                })
        },
        function(products, cb) {
            var result = {
                group: statTypeGroup,
                stats:[]
            };

            async.eachSeries(employeeIds, function(employeeId, empCallback) {

                var employeeStat = {
                    employeeId: employeeId,
                    stats: []
                };

                result.stats.push(employeeStat);
                async.eachSeries(products, function(product, productCallback) {
                    async.eachSeries(statTypes, function(statType, statCallback) {
                        var calculator = require('./calculators/' + statType.key);// " calculators/" + statType + ".js"
                        calculator.calculate(employeeId, startDate, endDate, { productId: product.id }, function(err, value) {
                            if(err) return statCallback(err);
                            employeeStat.stats.push({
                                name : statType.key,
                                productId: product.id,
                                value : value
                            });
                            statCallback();
                        });
                    },
                    function(err) {
                        productCallback(err);
                    });
                }, function(err) {
                    empCallback(err);
                });
            }, function(err){
                if(err) return cb(err);

                cb(null, result);
            });
        }
    ],function(err, result) {
        if (err)  return callback(err);

        callback(null, result);
    });
};