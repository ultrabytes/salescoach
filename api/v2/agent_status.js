"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(filters, currentUser, function(err, clause){
        if(err) {
            response(res).failure(err);
        }
        else {
       db.agent_status.findAll({
                where : {account_id: currentUser.AccountId , ACTIVE: 1}

            }).then(function (as) {
                var items = as.map(function (c) {
                    return c.toModel();
                });
                response(res).page(items);
            }).catch(function(err){
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.agent_status.findById(id)
            .then(function (Agent_status) {
                toEntity(Agent_status, Model, req.currentUser,action)
                    .save()
                    .then(function (entity) {
                        response(res).data(entity.toModel());
                    })
                    .catch(function (err) {
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    } else {
        action = "create";
        db.agent_status.build(toEntity({}, Model, req.currentUser,action))
            .save()
            .then(function (entity) {
                response(res).data(entity.toModel());
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.agent_status.find({
        where: {
            agent_status_id: id,active:true
        },
        include: [
            {all: true}
        ]
    }).then(function (entity) {
        response(res).data(entity.toModel());
    }).catch(function (err) {
        response(res).failure(err);
    });
};


exports.delete = function (req, res) {
    var id = req.params.id;
    db.agent_status.findById(id)
            .then(function (object) {
                object.active = false;
                object.save()
                    .then(function (entity) {
                        response(res).success();
                    })
                    .catch(function (err) {
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                response(res).failure(err);
            });
};

var toEntity = function (entity, data, currentUser,action) {
    entity.account_id = currentUser.AccountId;
    entity.name = data.Name;
    entity.position = data.Position;
    entity.type = data.Type;
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
       entity.initial_create = new Date().getTime();
       entity.last_updated = entity.initial_create;
    }
    //entity.active = data.Active;
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
    var clause = [{ active:true }, sequelize.literal('(account_id in (SELECT account_id FROM employee WHERE employee_id = ' + currentUser.EmployeeId + '))')];
    if (filters.timestamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
    }
    callback(null, clause);
};