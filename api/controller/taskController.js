"use strict";
var async = require('async');
var db = require('../../models');
var _ = require('underscore');
var moment = require('moment');

var CreateForm = require('../forms/task').CreateTask;
var UpdateForm = require('../forms/task').UpdateTask;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createTask = function (data, callback) {
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
                .catch(function(err) {
                    wcallback(err);
                });
        },
        function(lead, contact, wcallback) {
            if (!data.lead.Name)
                lead.id = null;

            var dueDate = moment(data.DueDate, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
            if (data.CompletedOn != "")
            var completedOn = moment(data.CompletedOn, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                var Task = db.Task.build({
                    name: data.Name,
                    reminder: data.Reminder,
                    dueDate: data.DueDate,
                    dueDateTime: dueDate,
                    completedOn: data.CompletedOn,
                    completedOnDate: completedOn || null,
                    EmployeeId: data.currentUserId,
                    ContactId: contact.id,
                    LeadId: lead.id
                });
                Task.save()
                    .then(function (task) {
                        wcallback(null, task);
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

var updateTask = function (data, callback) {
    async.waterfall(
        [
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
            function (lead, contact, wcallback) {
                var dueDate = moment(data.DueDate, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                if (data.CompletedOn != "")
                var completedOn = moment(data.CompletedOn, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                db.Task.findById(data.Id)
                    .then(function (task) {
                        task.name = data.Name;
                        task.reminder = data.Reminder;
                        task.dueDate = data.DueDate;
                        task.dueDateTime = dueDate;
                        task.completedOn = data.CompletedOn;
                        task.completedOnDate = completedOn || null;
                        task.ContactId = contact.id;
                        task.LeadId = lead.id;

                        task.save()
                            .then(function (task) {
                                wcallback(null, task);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });
                    })
                    .catch(function (err) {
                        wcallback(err);
                    })
            }
        ],
        function (err, task) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, task);
        }
    );
};

exports.all = function (req, res) {
    db.Task.findAll({
        where:{
            EmployeeId: req.currentUser.id
        },
        include:[
            { all: true },
            {
                model: db.Contact,
                include: [{ all: true }]
            },
            {
                model: db.Lead,
                include: [{ all: true }]
            }
        ]
    })
        .then(function (cs) {
        res.json({
            IsSuccess: true,
            task: cs.map(function (c) {
                return c.json();
            })
        });
    })
        .catch(function () {
            res.json({
                result: 'ok'
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

            ((form.data.Id != 0) ? updateTask: createTask)(form.data, function (err, task) {
                if (err) {
                    res.json({
                        IsSuccess :  false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true,
                    ServerId: task.id
                });
            });
        }
    });
};

exports.getTask = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Task.findAll({
        where:{
            id: id
        },
        include: [
            { all: true }
        ]
    })
        .then(function (cs) {
            res.json({
                success: true,
                task: cs.map(function (c) {
                    return c.jsonDisplayTask();
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

exports.unSyncTask = function (req, res) {
    var lastSync = req.params.lastSync;
    var utc =  moment.utc(lastSync);
    db.Task.findAll({
        where: {
            EmployeeId : req.currentUser.id,
            updatedAt : {
                $gt: utc.toDate()
            }
        },
        include:[
            { all: true },
            {
                model: db.Contact,
                include: [{ all: true }]
            },
            {
                model: db.Lead,
                include: [{ all: true }]
            }
        ]
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                task: cs.map(function (c) {
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