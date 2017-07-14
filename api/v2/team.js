"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(filters, currentUser, function (err, clause) {
        if (err) {
            response(res).failure(err);
        }
        else {
            db.team.findAll({
                where: clause || {},
                include: [
                    { all: true }
                ]

            }).then(function (Team) {
                var items = Team.map(function (c) {
                    return c.toModel();
                });
                response(res).page(items);
            }).catch(function (err) {
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || req.params.TeamId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.team.findById(id)
            .then(function (team) {
                toEntity(team, Model, req.currentUser,action)
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
        var localId = req.body.LocalId || null;
        db.team.build(toEntity({}, Model, req.currentUser,action))
            .save()
            .then(function (entity) {
                response(res).data(entity.toModelPost(localId));
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.team.find({
        where: {
            team_id: id,active:true
        },
        include: [
            { all: true }
        ]
    }).then(function (entity) {
        response(res).data(entity.toModel());
    }).catch(function (err) {
        response(res).failure(err);
    });
};


exports.delete = function (req, res) {
    var id = req.params.id;
    db.team.findById(id)
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
    
    entity.supervisor_id = data.SupervisorId;
    entity.member_id = data.MemberId;  
    entity.account_id = currentUser.AccountId;
     entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    
   
     
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
    var clause = [{ active:true  }];
    if (filters.timestamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
    }
    callback(null, clause);
};
