"use strict";
var async = require('async');
var db = require('../../models');
var moment = require('moment');
var _ = require('underscore');

exports.activities = function (req, res) {
    async.waterfall([
        function(wcallback) {
            db.Team.findAll({
                where: {
                    supervisorId :  req.currentUser.id
                }
            }).then(function (members) {
                var employeeIds = [];
                _.each(members, function (member) {
                    employeeIds.push(member.json().memberId);
                });
                wcallback(null, employeeIds);
            })
                .catch(function() {
                    wcallback(err);
                });
        },
        function(employeeIds, wcallback){
            var date = req.params.date;
            var clouserDate = moment(date, "DD-MM-YYYY").format('YYYY-MM-DD 00:00:00');
            db.Lead.findAll({
                where: {
                    expectedClouserDateTime: clouserDate,
                    EmployeeId : {$in: employeeIds}
                },
                include: [
                    {all: true}
                ]
            })
                .then(function (leads) {
                    wcallback(null, employeeIds, leads)
            })
                .catch(function (err) {
                    wcallback(err);
                });
        },
        function(employeeIds, leads, wcallback){
            var date = req.params.date;
            var scheduleDate = moment(date, "DD-MM-YYYY").format('YYYY-MM-DD 00:00:00');
            db.Meeting.findAll({
                where:{
                    EmployeeId:{$in: employeeIds},
                    $or: [{
                        scheduleDate: scheduleDate
                    },
                    {
                        scheduleDate: {
                            $lte: scheduleDate
                        },
                        reviewStatus: {
                            $ne : 1
                        }
                    }]
                },
                include: [
                    {all: true}
                ]
            })
                .then(function (meetings) {

                wcallback(null, employeeIds, leads, meetings);
            })
                .catch(function (err) {
                    wcallback(err);
                });
        },
        function( employeeIds, leads, meetings, wcallback){
            var date = req.params.date;
            var dueDate = moment(date, "DD-MM-YYYY").format('YYYY-MM-DD 00:00:00');
            db.Task.findAll({
                where: {
                    EmployeeId:{$in: employeeIds},
                    $or: [{
                        dueDateTime: dueDate
                    },
                    {
                        dueDateTime: {
                            $lte: dueDate
                        },
                        completedOn: null
                    }]
                },
                include: [
                    {all: true}
                ]
            })
                .then(function (tasks) {
                    res.json({
                        IsSuccess: true,
                        lead: leads.map(function (c) {
                            return c.jsonCloserLead();
                        }),
                        meeting: meetings.map(function (c) {
                            return c.teamMeetingJson();
                        }),
                        task: tasks.map(function (c) {
                            return c.jsonTaskWithEmploee();
                        })
                    });
                })
                .catch(function () {
                    wcallback(err);
                });
        }
    ],function (err) {
        if (err)
            return  res.json({
                IsSuccess: false,
                message : err
            });
    });
};

exports.performance = function (req, res) {
    async.waterfall([
        function(wcallback) {
            db.Employee.findAll({
                where: {
                    EmployeeId :  req.currentUser.id
                }
            }).then(function (employees) {

                var period = req.params.period;
                var date = moment(req.params.date, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                var stats = ['Win Leads','AverageTicket Size','Pipeline Leads Size','New Leads Added','Meetings And Calls Added'];

                var teamPerformances = [];


                async.eachSeries(employees, function(employee, eCallback) {
                    var obj = {
                        id: employee.id,
                        Name: employee.name,
                        Win: 0,
                        Ats: 0,
                        Pipeline: 0,
                        NewLead: 0,
                        Meeting: 0
                    };

                    db.Performance.findAll({
                        where: {
                            EmployeeId : employee.id,
                            period: period,
                            date: date
                        },
                        include: [{
                            model: db.Statistic,
                            where: {
                                key : {$in: stats}
                            }
                        }
                        ]
                    })
                        .then(function (performances) {
                            _.each(performances, function (performance) {
                               if (period === 'daily' ){
                                   if (performance.Statistic.key  === 'Win Leads'){
                                       if(performance.Statistic.dailyTarget  <= performance.value){
                                           obj.Win = 1;
                                       }
                                   }
                                   else if (performance.Statistic.key  === 'AverageTicket Size'){
                                       if(performance.Statistic.dailyTarget <= performance.value){
                                           obj.Ats = 1;
                                       }
                                   }
                                   else if (performance.Statistic.key  === 'Pipeline Leads Size'){
                                       if(performance.Statistic.dailyTarget <= performance.value){
                                           obj.Pipeline = 1;
                                       }
                                   }
                                   else if (performance.Statistic.key  === 'New Leads Added'){
                                       if(performance.Statistic.dailyTarget <= performance.value){
                                           obj.NewLead = 1;
                                       }
                                   }
                                   else if (performance.Statistic.key   === 'Meetings And Calls Added'){
                                       if(performance.Statistic.dailyTarget <= performance.value){
                                           obj.Meeting = 1;
                                       }
                                   }
                               }
                                if (period === 'week' ){
                                    if (performance.Statistic.key  === 'Win Leads'){
                                        if(performance.Statistic.weekTarget  <= performance.value){
                                            obj.Win = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'AverageTicket Size'){
                                        if(performance.Statistic.weekTarget <= performance.value){
                                            obj.Ats = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'Pipeline Leads Size'){
                                        if(performance.Statistic.weekTarget <= performance.value){
                                            obj.Pipeline = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'New Leads Added'){
                                        if(performance.Statistic.weekTarget <= performance.value){
                                            obj.NewLead = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key   === 'Meetings And Calls Added'){
                                        if(performance.Statistic.weekTarget <= performance.value){
                                            obj.Meeting = 1;
                                        }
                                    }
                                }
                                if (period === 'month' ){
                                    if (performance.Statistic.key  === 'Win Leads'){
                                        if(performance.Statistic.monthTarget  <= performance.value){
                                            obj.Win = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'AverageTicket Size'){
                                        if(performance.Statistic.monthTarget <= performance.value){
                                            obj.Ats = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'Pipeline Leads Size'){
                                        if(performance.Statistic.monthTarget <= performance.value){
                                            obj.Pipeline = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'New Leads Added'){
                                        if(performance.Statistic.monthTarget <= performance.value){
                                            obj.NewLead = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key   === 'Meetings And Calls Added'){
                                        if(performance.Statistic.monthTarget <= performance.value){
                                            obj.Meeting = 1;
                                        }
                                    }
                                }
                                if (period === 'quarter' ){
                                    if (performance.Statistic.key  === 'Win Leads'){
                                        if(performance.Statistic.quarterTarget  <= performance.value){
                                            obj.Win = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'AverageTicket Size'){
                                        if(performance.Statistic.quarterTarget <= performance.value){
                                            obj.Ats = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'Pipeline Leads Size'){
                                        if(performance.Statistic.quarterTarget <= performance.value){
                                            obj.Pipeline = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'New Leads Added'){
                                        if(performance.Statistic.quarterTarget <= performance.value){
                                            obj.NewLead = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key   === 'Meetings And Calls Added'){
                                        if(performance.Statistic.quarterTarget <= performance.value){
                                            obj.Meeting = 1;
                                        }
                                    }
                                }
                                if (period === 'year' ){
                                    if (performance.Statistic.key  === 'Win Leads'){
                                        if(performance.Statistic.yearTarget  <= performance.value){
                                            obj.Win = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'AverageTicket Size'){
                                        if(performance.Statistic.yearTarget <= performance.value){
                                            obj.Ats = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'Pipeline Leads Size'){
                                        if(performance.Statistic.yearTarget <= performance.value){
                                            obj.Pipeline = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key  === 'New Leads Added'){
                                        if(performance.Statistic.yearTarget <= performance.value){
                                            obj.NewLead = 1;
                                        }
                                    }
                                    else if (performance.Statistic.key   === 'Meetings And Calls Added'){
                                        if(performance.Statistic.yearTarget <= performance.value){
                                            obj.Meeting = 1;
                                        }
                                    }
                                }
                            });
                            teamPerformances.push(obj);
                            eCallback(null);
                        })
                        .catch(function (err) {
                            wcallback(err);
                        });
                }, function(err){
                    wcallback(err, teamPerformances)
                });
            })
                .catch(function() {
                    wcallback(err);
                });
        }
    ],function (err, teamPerformances) {
        if (err){
            res.json({
                IsSuccess: false,
                message : err
            });
            return;
        }
        res.json({
            IsSuccess: true,
            performance: teamPerformances
        });
    });
};
