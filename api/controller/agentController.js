"use strict";
var async = require('async');
var db = require('../../models');
var _ = require('underscore');
var moment = require('moment');

var CreateForm = require('../forms/agent').CreateAgent;
var UpdateForm = require('../forms/agent').UpdateAgent;
var formHelper = require('../forms/helper');

var createAgent = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            var Agent = db.Agent.build({
                name: data.Name,
                number: data.Number,
                email: data.Email,
                address: data.Address,
                age: data.Age,
                income: data.Income,
                experience: data.Experience,
                status: data.Status,
                EmployeeId: data.currentUserId
            });
            Agent.save()
                .then(function (agent) {
                    if (!data.organization.Name)
                        return wcallback(null, agent);

                    db.AgentOrganization.find({
                        where: {
                            id: data.organization.ServerId
                        }
                    })
                        .then(function(organization) {
                            if (organization) {
                                var AgentOrganizationMap = db.AgentOrganizationMap.build({
                                    AgentId : agent.id,
                                    OrganizationId: organization.id
                                });
                                AgentOrganizationMap.save()
                                    .then(function () {

                                        wcallback(null, agent);
                                    })
                                    .catch(function (err) {
                                        wcallback(err);
                                    });
                            }
                        })
                        .catch(function(err) {
                            wcallback(err);
                        });
                 })
                .catch(function (err) {
                    wcallback(err);
                });
        },
        function(agent, wcallback) {
            async.eachSeries(data.stageList , function (stage, next) {
                if (!stage)
                    return next(null, agent);

                var date = moment(stage.Date, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                var Stage = db.StageRecruitment.build({
                    name: stage.Name,
                    date: date,
                    isCurrent: stage.IsCurrent,
                    EmployeeId: data.currentUserId,
                    AgentId: agent.id
                });
                Stage.save()
                    .then(function () {
                        next();
                    })
                    .catch(function (err) {
                        next(err);
                    })
            },function(err){
                if(err)
                    return wcallback(err);
                wcallback(null, agent);
            });
        }
    ],function(err, agent){
        if(err)
            return callback(err);
        callback(null, agent);
    });
};

var updateAgent = function (data, callback) {
    async.waterfall([
            function (wcallback) {
                db.Agent.findById(data.Id)
                    .then(function (agent) {
                        agent.name = data.Name;
                        agent.number = data.Number;
                        agent.email = data.Email;
                        agent.address = data.Address;
                        agent.age = data.Age;
                        agent.income = data.Income;
                        agent.experience= data.Experience;
                        agent.status= data.status;

                        agent.save()
                            .then(function (agent) {
                                if (!data.organization.Name)
                                    return wcallback(null, agent);

                                db.AgentOrganization.find({
                                    where: {
                                        id: data.organization.ServerId
                                    }
                                })
                                    .then(function(organization) {
                                        if (organization) {
                                            db.AgentOrganizationMap.findOrCreate({
                                                where: {
                                                    AgentId : agent.id,
                                                    OrganizationId: organization.id
                                                },
                                                default: {
                                                    AgentId : agent.id,
                                                    OrganizationId: organization.id
                                                }
                                            }).spread(function (amc) {
                                                if (!amc)
                                                    return wcallback('Amc already exist');

                                                wcallback(null, agent);
                                            })
                                        }
                                    })
                                    .catch(function(err) {
                                        wcallback(err);
                                    });
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });

                    }).catch(function (err) {
                        wcallback(err);
                    });
            },
            function (agent, wcallback) {
                async.eachSeries(data.stageList, function (stage, next) {
                    var date = moment(stage.Date, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                    db.StageRecruitment.find({
                            where: {
                                AgentId: agent.id,
                                name: stage.Name,
                                EmployeeId: data.currentUserId
                            }
                        })
                        .then(function(stateModel) {
                            if (stateModel) {
                                stateModel.name = stage.Name;
                                stateModel.date = date;
                                stateModel.isCurrent = stage.IsCurrent;

                                stateModel.save()
                                    .then(function () {
                                        next();
                                    })
                                    .catch(function (err) {
                                        next(err);
                                    });
                            }
                            else{
                                if (!stage)
                                    return next(null, agent);

                                var State = db.StageRecruitment.build({
                                    name: stage.Name,
                                    date: date,
                                    isCurrent: stage.IsCurrent,
                                    AgentId: agent.id,
                                    EmployeeId: data.currentUserId
                                });
                                State.save()
                                    .then(function () {
                                        next();
                                    })
                                    .catch(function (err) {
                                        next(err);
                                    });
                            }
                        })
                        .catch(function() {
                            next(err);
                        });
                },function(err){
                    if(err)
                        return wcallback(err);
                    wcallback(null, agent);
                });
            }
        ],
        function (err ,lead) {
            if (err) {
                callback(err);
                return;
            }
            callback(null ,lead);
        }
    );
};

exports.all = function (req, res) {
    db.Agent.findAll({
        where:{
            EmployeeId: req.currentUser.id
        },
        include: [
            { all: true }
        ]
    })
        .then(function (cs) {
            res.json({
                IsSuccess:  true,
                lead: cs.map(function (c) {
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

            ((form.data.Id != 0) ? updateAgent : createAgent)(form.data, function (err, agent) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true,
                    ServerId: agent.id
                });
            });
        }
    });
};

exports.getAgent = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Agent.findAll(id)
        .then(function (agent) {
            res.json({
                success: true,
                agent: agent.map.json()
            });
        })
        .catch(function (err) {
            res.json({
                result: 'error'
            });
        });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Agent.destroy({
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
            updateAgent(data, function (err) {
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

exports.employeeAgents = function (req, res) {
    var stage = req.params.stage;
    db.StageRecruitment.findAll({
        where: {
            name: stage,
            isCurrent: true,
            EmployeeId: req.currentUser.id
        },
        include : [{model: db.Agent}]
    })
        .then(function (cs) {
            res.json({
                success: true,
                agents: cs.map(function (c) {
                    return c.Agent.jsonemployeeAgent();
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
