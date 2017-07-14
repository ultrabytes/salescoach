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
        if (err) {
            response(res).failure(err);
        }
        else {
            db.target_selection_sub_type.findAll({
                where: clause || {},
                include: [
                    { all: true }
                ]

            }).then(function (Target_selection_sub_type) {
                var items = Target_selection_sub_type.map(function (c) {
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

    var id = req.params.id || Model.TargetSelectionSubId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.target_selection_sub_type.findById(id)
            .then(function (Target_selection_sub_type) {
                toEntity(Target_selection_sub_type, Model, req.currentUser,action)
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
        db.target_selection_sub_type.build(toEntity({}, Model, req.currentUser,action))
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
    db.target_selection_sub_type.find({
        where: {
            target_selection_sub_id: id
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

var toEntity = function (entity, data, currentUser ,action) {
     
    entity.target_selection_id = data.TargetSelectionId;
    entity.name = data.Name;   
    entity.account_id = currentUser.AccountId;  
    entity.target_assignment_for = data.TargetAssignmentFor; 
    entity.description = data.Description; 
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    
    entity.active = data.Active;
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
    var clause = [{  }];
    if (filters.timestamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
    }
    callback(null, clause);
};