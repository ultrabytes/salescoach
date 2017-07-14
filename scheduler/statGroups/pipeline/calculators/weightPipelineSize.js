var async = require('async');
var config = require('../../../schduleRunner').StatePercentage;
var db = require('../../../../models');

var calculateWeightedSize = function(employeeId, startDate, endDate, options, callback) {
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
                    name: options.leadStage
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
        var amount = sum/config[options.leadStage];
            if(!isFinite(amount)){
                amount = 0;
            }

        callback(null, amount);
    })
    .catch(function(err){
        callback(err);
    });
};

exports.calculate = function(employeeId, startDate, endDate, options, callback){
    async.waterfall([
        function(cb) {
            calculateWeightedSize(employeeId, startDate, endDate, {leadStage:'Prospects'}, function(err, amount) {
                if(err) return cb(err);
                cb(null, amount);
            });
        },
        function(ProspectsAmount, cb) {
            calculateWeightedSize(employeeId, startDate, endDate, {leadStage:'Proposal Given'}, function(err, amount) {
                if(err) return cb(err);
                cb(null, ProspectsAmount, amount);
            });
        },
        function(ProspectsAmount, ProposalGivenAmount, cb) {
            calculateWeightedSize(employeeId, startDate, endDate, {leadStage:'In Negotiation'}, function(err, amount) {
                if(err) return cb(err);
                cb(null, ProspectsAmount, ProposalGivenAmount, amount);
            });
        },
        function(ProspectsAmount, ProposalGivenAmount, InNegotiationAmount, cb) {
            calculateWeightedSize(employeeId, startDate, endDate, {leadStage:'Contacted'}, function(err, amount) {
                if(err) return cb(err);
                cb(null, ProspectsAmount, ProposalGivenAmount, InNegotiationAmount, amount);
            });
        },
        function(ProspectsAmount, ProposalGivenAmount, InNegotiationAmount,ContactedAmount, cb) {
            var sum = ProspectsAmount+ProposalGivenAmount+InNegotiationAmount+ContactedAmount;
            cb(null, sum)
        }
    ], function(err, total) {
        if (err)
            callback(err);

        callback(null, total);
    });
};