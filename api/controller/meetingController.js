"use strict";
var async = require('async');
var db = require('../../models');
var _ = require('underscore');
var moment = require('moment');

var CreateForm = require('../forms/meeting').CreateMeeting;
var UpdateForm = require('../forms/meeting').UpdateMeeting;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createMeeting = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            if (!data.lead.Name)
                return wcallback(null, data.lead);

            db.Lead.findById(data.lead.ServerId)
                .then(function (lead) {
                    wcallback(null, lead);
                })
                .catch(function (err) {
                    wcallback(err);
                });
        },
        function(lead, wcallback) {
            db.Contact.findById(data.contact.ServerId)
                .then(function(contact) {

                    wcallback(null, lead, contact);
                })
                .catch(function() {
                    wcallback(err);
                });
        },
        function(lead, contact, wcallback) {
            db.MeetingType.find({
                where :{
                    type: data.meetingType.Type
                }
            })
                .then(function (meetingType) {
                    if (meetingType)
                        wcallback(null, lead, contact, meetingType);

                    else {
                        var MeetingType = db.MeetingType.build({
                            type: data.meetingType.Type
                        });
                        MeetingType.save()
                            .then(function (meetingType) {
                                wcallback(null, lead, contact, meetingType);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });
                    }
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
        },
        function(lead, contact, meetingType, wcallback) {
            if (!data.lead.Name)
                lead.id = null;

            var scheduleDate = moment(data.Schedule, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

            if (data.CompletedOn != "")
                var completedOn = moment(data.CompletedOn, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

            if (data.ReviewedOn != "")
                var reviewedOn = moment(data.CompletedOn, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                var Meeting = db.Meeting.build({
                    time: data.Time,
                    schedule: data.Schedule,
                    scheduleDate: scheduleDate,
                    purpose: data.Purpose,
                    completedOn: data.CompletedOn,
                    completedOnDate: completedOn || null,
                    location: data.Location,
                    reviewedOn: data.ReviewedOn,
                    reviewedOnDate: reviewedOn || null,
                    reviewStatus: data.ReviewStatus,
                    q1: data.Q1,
                    q2: data.Q2,
                    q3: data.Q3,
                    q4: data.Q4,
                    q5: data.Q5,
                    leadStageName: data.LeadStageName,
                    leadStageData: data.LeadStageData,
                    note: data.Notes,
                    EmployeeId: data.currentUserId,
                    MeetingTypeId: meetingType.id,
                    ContactId : contact.id,
                    LeadId: lead.id
                });
                Meeting.save()
                    .then(function (meeting) {
                        wcallback(null, meeting);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
        }
    ],function(err, model){
        if(err)
            return callback(err);
        callback(null,model);
    });
};

var updateMeeting = function (data, callback) {
    async.waterfall([
            function(wcallback) {
                if (!data.lead.Name)
                    return wcallback(null, data.lead);

                db.Lead.findById(data.lead.ServerId)
                    .then(function (lead) {
                        wcallback(null, lead);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            },
            function(lead, wcallback) {
                db.Contact.findById(data.contact.ServerId)
                    .then(function(contact) {

                        wcallback(null, lead, contact);
                    })
                    .catch(function() {
                        wcallback(err);
                    });
            },
            function(lead, contact, wcallback) {
                db.MeetingType.find({
                    where :{
                        type: data.meetingType.Type
                    }
                })
                    .then(function (meetingType) {
                        if (meetingType)
                            wcallback(null, lead, contact, meetingType);

                        else {
                            var MeetingType = db.MeetingType.build({
                                type: data.meetingType.Type
                            });
                            MeetingType.save()
                                .then(function (meetingType) {
                                    wcallback(null, lead, contact, meetingType);
                                })
                                .catch(function (err) {
                                    wcallback(err);
                                });
                        }
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            },
            function (lead, contact, meetingType, wcallback) {
                db.Meeting.findById(data.Id)
                    .then(function (meeting) {

                    var scheduleDate = moment(data.Schedule, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                    if (data.CompletedOn != "")
                        var completedOn = moment(data.CompletedOn, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                    if (data.ReviewedOn != "")
                        var reviewedOn = moment(data.CompletedOn, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                        meeting.time = data.Time;
                        meeting.schedule= data.Schedule;
                        meeting.scheduleDate = scheduleDate;
                        meeting.purpose= data.Purpose;
                        meeting.completedOn= data.CompletedOn;
                        meeting.completedOnDate = completedOn;
                        meeting.location= data.Location;
                        meeting.reviewedOn= data.ReviewedOn;
                        meeting.reviewedOnDate = reviewedOn;
                        meeting.reviewStatus= data.ReviewStatus;
                        meeting.q1= data.Q1;
                        meeting.q2= data.Q2;
                        meeting.q3= data.Q3;
                        meeting.q4= data.Q4;
                        meeting.q5= data.Q5;
                        meeting.leadStageName= data.LeadStageName;
                        meeting.leadStageData= data.LeadStageData;
                        meeting.note= data.Notes;
                        meeting.MeetingTypeId = meetingType.id;
                        meeting.ContactId  = contact.id;
                        meeting.LeadId = lead.id;

                        meeting.save()
                        .then(function (meeting) {
                                wcallback(null, meeting);
                        })
                        .catch(function (err) {
                            wcallback(err);
                        });
                }).catch(function (err) {
                    wcallback(err);
                });
            }
        ],
        function (err, meeting) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, meeting);
        }
    );
};

exports.all = function (req, res) {
    var startDate = req.params.startDate;
    var scheduleDate = moment(startDate, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
    db.Meeting.findAll({
        where:{
            EmployeeId: req.currentUser.id,
            $or: [{
                    scheduleDate: {
                        $gte: scheduleDate
                    }
                },
                {
                    scheduleDate: {
                        $lte: scheduleDate
                    },
                    reviewStatus: {
                        $ne: 1
                    }
                }]
        },
        include: [
            { all: true },
            {
                model: db.Lead,
                include: [{ all: true }]
            }
        ]
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                meeting: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function (err) {
            res.json({
                IsSuccess: false,
                message: err
            });
        });
};

exports.create = function (req, res) {
    console.log(req.body);
    CreateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            form.data.currentUserId = req.currentUser.id;
            form.data.Id = req.body.ServerId;

            ((form.data.Id != 0) ? updateMeeting: createMeeting)(form.data, function (err, meeting) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true ,
                    ServerId: meeting.id
                });
            });
        }
    });
};

exports.getMeeting = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Meeting.findAll({
        where:{
            id: id
        },
        include: [
            { all: true },
            {
                model: db.Lead,
                include: [{ all: true }]
            }
        ]
    })
        .then(function (cs) {
            res.json({
                success: true,
                meeting: cs.map(function (c) {
                    return c.JsonMeetingDisplay();
                })
            });
        }).catch(function (err) {
            res.json({
                result: 'error'
            });
        });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Task.destroy({
        where: {
            id: id
        }
    }).then(function () {
        res.json({
            result: 'ok'
        });
    }).catch(function () {
        res.json({
            result: 'error'
        });
    });
};

exports.update = function (req, res) {
    var id = req.params.id;
    console.log(req.body);
    UpdateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            var data = form.data;
            data.id = id;
            updateTask(data, function (err) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true
                });
            });
        }
    });
};

exports.teamSummary = function (req, res) {
    var date = req.params.date;
    var employeeId = req.query.id || req.currentUser.id;
    var dateObj = moment(date, "DD-MM-YYYY").format('YYYY-MM-DD 00:00:00');
    async.waterfall([
        function(cb){
            db.Team.findAll({
                where: {
                    supervisorId : employeeId
                }
            }).then(function (members) {
                var employeeIds = [];
                _.each(members, function (member) {
                    employeeIds.push(member.json().memberId);
                });
                employeeIds.push(req.query.id);
                cb(null, employeeIds);
            }).catch(cb);
        },
        function (employeeIds, cb) {
            db.Employee.findAll({
                where: {
                    id: {$in: employeeIds}
                },
                include: [{
                    model: db.Meeting,
                    include: [{
                            model: db.MeetingType
                        }
                    ]}
                ]
            }).then(function (employees) {
                cb(null, employees);
            }).catch(cb);
        },
        function (employees, cb) {
            if(employees.length === 0 ) {
                return cb( null, []);
            }

            var summaries = [];

            _.each(employees, function (employee) {
                var obj = {
                    id: employee.id,
                    Name: employee.name,
                    supervisorId: employee.EmployeeId,
                    hasTeam: false,
                    meetingCount: 0,
                    meetingReviewed: 0,
                    callCount: 0,
                    callReviewed: 0,
                    dsrStatus: 0,
                    count: 0
                };

                _.each(employee.Meetings, function (meeting) {
                    if (meeting.scheduleDate  === dateObj){
                        if (meeting.MeetingType.type == 'call') {
                            if (meeting.reviewStatus != -1) {
                                obj.callReviewed += 1;
                                obj.callCount += 1;
                                if (meeting.reviewStatus == 1){
                                    obj.dsrStatus += 1;
                                }
                            }
                            else {
                                if (meeting.reviewStatus == 1){
                                    obj.dsrStatus += 1;
                                }
                                if (meeting.reviewStatus == -1)
                                {
                                    obj.dsrStatus -= 1
                                }
                                obj.callCount += 1;
                            }
                        }
                        else {
                            if(meeting.reviewStatus != -1){
                                obj.meetingReviewed += 1;
                                obj.meetingCount += 1;
                                if (meeting.reviewStatus == 1){
                                    obj.dsrStatus += 1;
                                }
                            }
                            else {
                                if (meeting.reviewStatus == 1){
                                    obj.dsrStatus += 1;
                                }
                                if (meeting.reviewStatus == -1)
                                {
                                    obj.dsrStatus -= 1
                                }
                                obj.meetingCount += 1;
                            }
                        }
                        obj.count += 1;
                    }
                });

                if(obj.count == 0){
                    obj.dsrStatus = -1;
                }
                if(obj.count == obj.dsrStatus){
                    obj.dsrStatus = 1;
                }
                else if(-(obj.count) == obj.dsrStatus){
                    obj.dsrStatus = -1;
                }
                else if (obj.count != 0 && obj.count != obj.dsrStatus) {
                    obj.dsrStatus = 0;
                }

                summaries.push(obj);

                db.Team.findAll({
                    where: {
                        supervisorId: employee.id
                    }
                }).then(function (members) {
                    if (members.length != 0)
                        obj.hasTeam = true;
                });
            });

             var summary = _.find(summaries, function(item){
                return item.id == req.query.id;
            });
            if (summary)
            var currentUserSummery = JSON.parse(JSON.stringify(summary));

            async.each(summaries, function(summary, eCallback) {
                db.Team.findAll({
                    where: {
                        memberId : summary.id
                    }
                }).then(function (supervisors) {
                    _.each(supervisors, function(supervisor){
                        supervisor = supervisor.json();
                        var supervisorSummary = _.find(summaries, function(item){
                            return item.id === supervisor.supervisorId;
                        });

                        if(supervisorSummary){
                            supervisorSummary.meetingCount += summary.meetingCount;
                            supervisorSummary.meetingReviewed += summary.meetingReviewed;
                            supervisorSummary.callCount += summary.callCount;
                            supervisorSummary.callReviewed += summary.callCount;
                            if(supervisorSummary.dsrStatus == 1){
                                if (summary.dsrStatus == 1)
                                    supervisorSummary.dsrStatus = 1;
                                if (summary.dsrStatus == -1)
                                    supervisorSummary.dsrStatus = 0;
                                if (summary.dsrStatus == 0){
                                    supervisorSummary.dsrStatus = 0;
                                }
                            }
                            if(supervisorSummary.dsrStatus == -1){
                                if (summary.dsrStatus == 1)
                                    supervisorSummary.dsrStatus = 0;
                                if (summary.dsrStatus == -1)
                                    supervisorSummary.dsrStatus = -1;
                                if (summary.dsrStatus == 0){
                                    supervisorSummary.dsrStatus = 0;
                                }
                            }
                            if (supervisorSummary.dsrStatus == 0){
                                supervisorSummary.dsrStatus = 0;
                            }
                            supervisorSummary.count = supervisorSummary.meetingCount + supervisorSummary.callCount;
                        }
                    });


                    eCallback(null);
                });
            }, function(err){
                var retValue = [];
                if(currentUserSummery)
                    retValue.push(currentUserSummery);

                    var childSummery =_.filter(summaries, function(summary){
                    return summary.supervisorId == employeeId;
                });
                _.each(childSummery, function(summary){
                    retValue.push(summary);
                });
                cb(err, retValue);
            });
        }
    ],function(err, summaries){
        if(err) {
            res.json({
                IsSuccess: false,
                message: err
            });
            return;
        }
        res.json({
            IsSuccess: true,
            employees: summaries
        });
    });
};

exports.meetingLeadByEmployeeId = function (req, res) {
    var date = req.params.date;
    var EmployeeId = req.params.id;
    var scheduledate = moment(date, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
    db.Meeting.findAll({
        where:{
            EmployeeId: EmployeeId,
            schedule: scheduledate
        },
        include: [
            { all: true },
            {
                model: db.Lead,
                include: [{ all: true }]
            }
        ]
    })
        .then(function (cs) {
            if(cs.length === 0 ) {
                return res.json({
                    IsSuccess: true,
                    employees:  [{
                        meetings:[],
                        calls:[],
                        leads: []
                    }]
                });
            }

            var retVal = cs.map(function (item) {
                var obj = {
                    meetings:[],
                    calls:[],
                    leads: []
                };

                if(item.MeetingType.type =='call') {
                    if (item.reviewStatus != -1) {
                        obj.calls.push((item.jsonMeetingWithContact()));

                        if (item.Lead != null)
                            obj.leads.push(item.Lead.jsonTask());
                    }
                } else {
                    if (item.reviewStatus != -1) {
                        obj.meetings.push(item.jsonMeetingWithContact());

                        if (item.Lead != null)
                            obj.leads.push(item.Lead.jsonTask());
                    }
                }
                return obj;
            });

            res.json({
                IsSuccess: true,
                employees: retVal
            });
        })
        .catch(function (err) {
            res.json({
                IsSuccess: false
            });
        });
};

exports.unSyncMeeting = function (req, res) {
    var lastSync = req.params.lastSync;
    var utc =  moment.utc(lastSync);
    db.Meeting.findAll({
        where: {
            EmployeeId : req.currentUser.id,
            updatedAt : {
                $gt: utc.toDate()
            }
        },
        include: [
            { all: true },
            {
                model: db.Lead,
                include: [{ all: true }]
            }
        ]
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                meeting: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function () {
            res.json({
                IsSuccess: false
            });
        });
};
