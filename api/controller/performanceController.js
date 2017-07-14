"use strict";
var db = require('../../models');
var _ = require('underscore');
var moment = require('moment');
var async = require('async');

exports.salesProductivity = function (req, res) {
    var period = req.params.period;
    var startOf = req.params.startOf;
    var date = req.params.date;
    if (period === 'Yearly'){
        var utcDate =moment(date).month(3).startOf('month').toDate();
    }
    else {
        var startDate =  moment(date).startOf(startOf);
        //var utcDate = moment.utc(startDate).toDate();
        var endDate = moment(date).endOf(startOf);
        var startUtcDate = moment.utc(startDate).toDate();
        var endUtcDate = moment.utc(endDate).toDate();
    }


    var id = req.query.id || req.currentUser.id;


    async.waterfall([
        function(wcallback) {
            db.Performance.findAll({
                where:{
                    EmployeeId: id,
                    period: period,
                    date:  {
                        $gte : startUtcDate,
                        $lte: endUtcDate
                    }
                },
                include: [
                    {all:true},
                    {
                        model:db.Statistic,
                        where:{
                            statsGroup: 'productivity'
                        }
                    }
                ]
            })
                .then(function (data) {
                    var obj = {
                        winAmount: 0,
                        lossAmount: 0,
                        winLeads: 0,
                        lostLeads: 0,
                        averageTicketSize: 0
                    };

                    if(data.length === 0 )
                        wcallback(null, obj);

                    _.each(data, function (item) {
                        if(item.Statistic.key === 'winningLeadAmount') {
                            obj.winAmount = item.value;
                        }
                        else if(item.Statistic.key === 'lostLeadAmount') {
                            obj.lossAmount = item.value;
                        }
                        else if(item.Statistic.key === 'winningLeadCount') {
                            obj.winLeads = item.value;
                        }
                        else if(item.Statistic.key === 'lostLeadCount') {
                            obj.lostLeads = item.value;
                        }
                        else if(item.Statistic.key === 'averageTicketSize') {
                            obj.averageTicketSize = item.value;
                        }
                        return obj;
                    });

                        wcallback(null, obj);
                })
                .catch(function (err) {
                     wcallback(err);
                });
        },
        function(object, wcallback) {
            db.Performance.findAll({
                where:{
                    EmployeeId: id,
                    period: period,
                    date:  {
                        $gte : startUtcDate,
                        $lte: endUtcDate
                    }
                },
                include: [
                    {all:true},
                    {
                        model:db.Statistic,
                        where:{
                            statsGroup: 'productProductivity'
                        }
                    }
                ]
            })
                .then(function(data) {
                    var list = [];

                    _.each(data, function (item) {
                        var productObject = {
                            name: item.Product.name,
                            value: 0,
                            percentage: 0,
                            Key: item.Statistic.key
                        };

                        var productValue = _.find(data, function(item){
                            return item.Statistic.key === 'productAmount' && item.Product.name == productObject.name;
                        });
                        productObject.value = productValue.value;

                        var productPercentage = _.find(data, function(item){
                            return item.Statistic.key === 'productPercentage' && item.Product.name == productObject.name;
                        });
                        productObject.percentage = productPercentage.value;

                        list.push(productObject);
                    });
                    var salesByProduct =_.filter(list, function(item){
                        return  item.Key === 'productAmount';
                    });
                    wcallback(null, object, salesByProduct);
                })
                .catch(function() {
                    wcallback(err);
                });
        }
    ],function(err, object, salesByProduct){
        if(err){
            res.json({
                IsSuccess: false,
                message: err
            });
            return;
        }

        var response = {
            winAmount: 0,
            lossAmount: 0,
            winLeads: 0,
            lostLeads: 0,
            averageTicketSize: 0,
            salesByProduct :[]
        };

        response.winAmount = object.winAmount;
        response.lossAmount = object.lossAmount;
        response.winLeads = object.winLeads;
        response.lostLeads = object.lostLeads;
        response.averageTicketSize = object.averageTicketSize;
        response.salesByProduct = salesByProduct;

        res.json(response);
    });
};

exports.pipeline = function (req, res) {
    var period = req.params.period;
    var startOf = req.params.startOf;
    var date = req.params.date;
    var startDate =  moment(date).startOf(startOf);
    var endDate = moment(date).endOf(startOf);
    var startUtcDate = moment.utc(startDate).toDate();
    var endUtcDate = moment.utc(endDate).toDate();

    var id = req.query.id || req.currentUser.id;
    db.Performance.findAll({
        where:{
            EmployeeId: id,
            period: period,
            date:  {
                $gte : startUtcDate,
                $lte: endUtcDate
            }
        },
        include: [
            {all:true},
            {
                model:db.Statistic,
                where:{
                    statsGroup: 'pipeline'
                }
            }
        ]
    })
        .then(function (data) {
            if(data.length === 0 ) {
                return res.json({
                    pipelineLeadsAmount: 0,
                    pipelineLeadsSize: 0,
                    avarageAgeing: 0,
                    prospectsLeadsAmount : 0,
                    contactedLeadsAmount: 0,
                    proposalGivenLeadsAmount: 0,
                    inNegotiationLeadsAmount: 0
                });
            }

            var obj = {
                pipelineLeadsAmount: 0,
                pipelineLeadsSize: 0,
                avarageAgeing: 0,
                prospectsLeadsAmount : 0,
                contactedLeadsAmount: 0,
                proposalGivenLeadsAmount: 0,
                inNegotiationLeadsAmount: 0
            };

            _.each(data, function (item) {
                if(item.Statistic.key === 'pipelineSizeAmount') {
                    obj.pipelineLeadsAmount = item.value;
                }
                else if(item.Statistic.key === 'pipelineSizeCount') {
                    obj.pipelineLeadsSize = item.value;
                }
                else if(item.Statistic.key === 'Avarage Ageing') {
                    obj.avarageAgeing = item.value;
                }
                else if(item.Statistic.key === 'prospectsLeadAmount') {
                    obj.prospectsLeadsAmount = item.value;
                }
                else if(item.Statistic.key === 'contactedLeadAmount') {
                    obj.contactedLeadsAmount = item.value;
                }
                else if(item.Statistic.key === 'proposalGivenLeadAmount') {
                    obj.proposalGivenLeadsAmount = item.value;
                }
                else if(item.Statistic.key === 'inNegotiationLeadAmount') {
                    obj.inNegotiationLeadsAmount = item.value;
                }
                return obj;
            });

            res.json(obj);
        })
        .catch(function (err) {
            res.json({
                success: false,
                message: err
            });
        });
};

exports.conversions = function (req, res) {
    var period = req.params.period;
    var startOf = req.params.startOf;
    var date = req.params.date;
    var startDate =  moment(date).startOf(startOf);
    var endDate = moment(date).endOf(startOf);
    var startUtcDate = moment.utc(startDate).toDate();
    var endUtcDate = moment.utc(endDate).toDate();

    var id = req.query.id || req.currentUser.id;
    db.Performance.findAll({
        where:{
            EmployeeId: id,
            period: period,
            date:  {
                $gte : startUtcDate,
                $lte: endUtcDate
            }
        },
        include: [{
                model:db.Statistic,
                where:{
                    statsGroup: 'conversion'
                }
            }
        ]
    })
        .then(function (data) {
            if(data.length === 0 ) {
                return res.json({
                    leadsToClosure: 0,
                    averageSales: 0,
                    callsToMeeting: 0,
                    meetingToLeads : 0,
                    leadsToProposal: 0,
                    proposalToClouser: 0,
                    meetingToClouser: 0
                });
            }

            var obj = {
                leadsToClosure: 0,
                averageSales: 0,
                callsToMeeting: 0,
                meetingToLeads : 0,
                leadsToProposal: 0,
                proposalToClouser: 0,
                meetingToClouser: 0
            };

            _.each(data, function (item) {
                if(item.Statistic.key === 'leadsToClosure') {
                    obj.leadsToClosure = item.value;
                }
                else if(item.Statistic.key === 'averageSalesCycle') {
                    obj.averageSales = item.value;
                }
                else if(item.Statistic.key === 'callToMeeting') {
                    obj.callsToMeeting = item.value;
                }
                else if(item.Statistic.key === 'meetingToLead') {
                    obj.meetingToLeads = item.value;
                }
                else if(item.Statistic.key === 'leadsToProposals') {
                    obj.leadsToProposal = item.value;
                }
                else if(item.Statistic.key === 'proposalToClosure') {
                    obj.proposalToClouser = item.value;
                }
                else if(item.Statistic.key === 'meetingsToClosure') {
                    obj.meetingToClouser = item.value;
                }
                return obj;
            });

            res.json(obj);
        })
        .catch(function (err) {
            res.json({
                success: false,
                message: err
            });
        });
};

exports.leadGeneration = function (req, res) {
    var period = req.params.period;
    var startOf = req.params.startOf;
    var date = req.params.date;
    var startDate =  moment(date).startOf(startOf);
    var endDate = moment(date).endOf(startOf);
    var startUtcDate = moment.utc(startDate).toDate();
    var endUtcDate = moment.utc(endDate).toDate();

    var id = req.query.id || req.currentUser.id;
    db.Performance.findAll({
        where:{
            EmployeeId: id,
            period: period,
            date:  {
                $gte : startUtcDate,
                $lte: endUtcDate
            }
        },
        include: [{
            model:db.Statistic,
            where:{
                statsGroup: 'leadGeneration'
            }
        }]
    })
        .then(function (data) {
            if(data.length === 0 ) {
                return res.json({
                    newLeadAdded: 0,
                    leadsDropped: 0,
                    referrals: 0,
                    cross : 0
                });
            }

            var obj = {
                newLeadAdded: 0,
                leadsDropped: 0,
                referrals: 0,
                cross : 0
            };

            _.each(data, function (item) {
                if(item.Statistic.key === 'newLeadCount') {
                    obj.newLeadAdded = item.value;
                }
                else if(item.Statistic.key === 'droppedLeadCount') {
                    obj.leadsDropped = item.value;
                }
                else if(item.Statistic.key === 'referralLeadCount') {
                    obj.referrals = item.value;
                }
                else if(item.Statistic.key === 'crossSellingLeadCount') {
                    obj.cross = item.value;
                }
                return obj;
            });

            res.json(obj);
        })
        .catch(function (err) {
            res.json({
                success: false,
                message: err
            });
        });
};

exports.activities = function (req, res) {
    var period = req.params.period;
    var startOf = req.params.startOf;
    var date = req.params.date;
    var startDate =  moment(date).startOf(startOf);
    var endDate = moment(date).endOf(startOf);
    var startUtcDate = moment.utc(startDate).toDate();
    var endUtcDate = moment.utc(endDate).toDate();

    var id = req.query.id || req.currentUser.id;
    db.Performance.findAll({
        where:{
            EmployeeId: id,
            period: period,
            date:  {
                $gte : startUtcDate,
                $lte: endUtcDate
            }
        },
        include: [{
            model:db.Statistic,
            where:{
                statsGroup: 'activities'
            }
        }]
    })
        .then(function (data) {
            if(data.length === 0 ) {
                return res.json({
                    meetingsAndCallsAdded : 0,
                    dsrCompletion: 0,
                    existingClientMet: 0,
                    existingClientNotMet : 0
                });
            }

            var obj = {
                meetingsAndCallsAdded : 0,
                dsrCompletion: 0,
                existingClientMet: 0,
                existingClientNotMet : 0
            };

            _.each(data, function (item) {
                if(item.Statistic.key === 'meetingCallsCompletedCount') {
                    obj.meetingsAndCallsAdded = item.value;
                }
                else if(item.Statistic.key === 'prospectingCallCount' ) {
                    obj.prospectingCallCount = item.value;
                }
                else if(item.Statistic.key === 'DSR Completion') {
                    obj.dsrCompletion = item.value;
                }
                else if(item.Statistic.key === 'Existing Client Met') {
                    obj.existingClientMet = item.value;
                }
                else if(item.Statistic.key === 'Existing Client Not Met') {
                    obj.existingClientNotMet = item.value;
                }
                return obj;
            });

            res.json(obj);
        })
        .catch(function (err) {
            res.json({
                success: false,
                message: err
            });
        });
};

exports.forecast = function (req, res) {
    var date = req.params.date;
    var period = req.params.period;
    var id = req.query.id || req.currentUser.id;
    var dateObj = moment(date, "DD-MM-YYYY").format('YYYY-MM-DD 00:00:00');
    db.Performance.findAll({
        where:{
            EmployeeId: id,
            period: period,
            date: dateObj
        },
        include: [{
            model:db.Statistic,
            where:{
                statsGroup: 'Forcast'
            }
        }]
    })
        .then(function (data) {
            if(data.length === 0 ) {
                return res.json({
                    sales: 0,
                    averageTicketSize: 0,
                    salesByProduct:[]
                });
            }

            var obj = {
                sales: 0,
                averageTicketSize: 0,
                salesByProduct:[]
            };

            _.each(data, function (item) {
                if(item.Statistic.key === 'Sales Forcast') {
                    obj.sales = item.value;
                }
                else if(item.Statistic.key === 'Average Ticket Size Forcast') {
                    obj.averageTicketSize = item.value;
                }
                else {
                    var product = {
                        name: item.Statistic.key,
                        value:item.value
                    };
                    obj.salesByProduct.push(product);
                }
                return obj;
            });

            res.json(obj);
        })
        .catch(function (err) {
            res.json({
                success: false,
                message: err
            });
        });
};
