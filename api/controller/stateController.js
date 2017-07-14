"use strict";
var async = require('async');
var db = require('../../models');

var CreateForm = require('../forms/state').CreateState;
var UpdateForm = require('../forms/state').UpdateState;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createState = function (data, callback) {
    var state = db.State.build({
        name: data.name,
        date: data.date,
        isCurrent: data.isCurrent,
        MeetingId: data.MeetingId,
        LeadId: data.LeadId,
        EmployeeId: data.currentUser
    });

    state.save()
        .then(function () {
            callback(null);
        })
        .catch(function (err) {
            callback(err);
        });
};

var updateState = function (data, callback) {
    async.waterfall(
        [
            function (wcallback) {
                db.State.findById(data.id).then(function (item) {
                    if (!item) {
                        wcallback("Cannot Find state");
                        return;
                    }
                    wcallback(null, item);
                }).catch(function (err) {
                    wcallback(err);
                });
            },
            function (state, wcallback) {
                var changedState = updateFields({
                    fields: ['name', 'date','isCurrent'],
                    newValues: data,
                    modelObj: state
                });
                state.save(changedState)
                    .then(function () {
                        wcallback(null);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            }
        ],
        function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        }
    );
};

exports.all = function (req, res) {
    db.State.findAll({
        where:{
            EmployeeId: req.currentUser
        }
    })
        .then(function (cs) {
        res.json({
            IsSuccess: true,
            data: {
                State: cs.map(function (c) {
                    return c.json();
                })
            }
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
            form.data.currentUser = req.currentUser.id
            createState(form.data, function (err) {
                if (err) {
                    res.json({
                        result: 'error'
                    });
                    return;
                }
                res.json({
                    result: 'ok'
                });
            });
        }
    });
};

exports.getState = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.State.findById(id).then(function (state) {
        if (!state) {
            res.json({
                result: 'error'
            });
            return;
        }
        res.json({
            result: 'ok',
            data: state.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.State.destroy({
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
            updateState(data, function (err) {
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


exports.userStates = function (req, res) {
    var id = req.params.id;
    db.State.findAll({
        where: {
            EmployeeId: id
        }
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                data: {
                    items: cs.map(function (c) {
                        return c.json();
                    })
                }
            });
        })
        .catch(function () {
            res.json({
                IsSuccess: false
            });
        });

};