"use strict";
var async = require('async');
var db = require('../../models');
var _ = require('underscore');
var moment = require('moment');

var CreateForm = require('../forms/agent').CreateAgentOrganization;
var UpdateForm = require('../forms/agent').UpdateAgentOrganization;

var createAgentOrganization = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            var AgentOrganization = db.AgentOrganization.build({
                name: data.Name
            });
            AgentOrganization.save()
                .then(function (organization) {

                    wcallback(null, organization);
                })
                .catch(function (err) {
                    wcallback(err);
                });
        }
    ],function(err, organization){
        if(err)
            return callback(err);
        callback(null, organization);
    });
};

var updateAgentOrganization = function (data, callback) {
    async.waterfall([
        function (wcallback) {
            db.AgentOrganization.findById(data.Id)
                .then(function (organization) {
                    organization.name = data.Name;
                    organization.save()
                        .then(function (organization) {

                            wcallback(null, organization)
                        .catch(function (err) {
                            wcallback(err);
                        });

                }).catch(function (err) {
                    wcallback(err);
                });
            })
        }],
        function (err ,organization) {
            if (err) {
                callback(err);
                return;
            }
            callback(null ,organization);
        }
    );
};

exports.all = function (req, res) {
    db.AgentOrganization.findAll()
        .then(function (cs) {
            res.json({
                IsSuccess:  true,
                organization: cs.map(function (c) {
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

exports.create = function (req, res) {
    console.log(req.body);
    CreateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            form.data.currentUserId = req.currentUser.id;
            form.data.Id = req.body.ServerId;

            ((form.data.Id != 0) ? updateAgentOrganization : createAgentOrganization)(form.data, function (err, organization) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true,
                    ServerId: organization.id
                });
            });
        }
    });
};

exports.getAgentOrganization = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.AgentOrganization.findAll(id)
        .then(function (organization) {
            res.json({
                success: true,
                organization : organization.map.json()
            });
        })
        .catch(function (err) {
            res.json({
                result: false,
                message: err
            });
        });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.AgentOrganization.destroy({
        where: {
            id: id
        }
    }).then(function () {
        res.json({
            success: true
        });
    }).catch(function () {
        res.json({
            success: false
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
            updateAgentOrganization(data, function (err) {
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
