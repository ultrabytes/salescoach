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
            db.screen_picklist.findAll({
                where: {account_id: currentUser.AccountId},
                include:[
                  {model: db.screen_picklist_master}
                ]

            }).then(function (Screen_picklist) {
                //res.send(Screen_picklist);
                // console.log("Account id is-------------->"+currentUser.AccountId);
                var items = Screen_picklist.map(function (c) {
                    var tempJson =  c.toModel();
                    if(c.screen_picklist_master){
                        tempJson.ScreenPicklistMaster = c.screen_picklist_master.toModel();
                    }else{
                        tempJson.ScreenPicklistMaster = null;
                    }
                    return tempJson;
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

    var id = req.params.id || Model.ScreenPicklistId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.screen_picklist.findById(id)
            .then(function (Screen_picklist) {
                toEntity(Screen_picklist, Model, req.currentUser,action)
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
        db.screen_picklist.build(toEntity({}, Model, req.currentUser,action))
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
    db.screen_picklist.find({
        where: {
            screen_picklist_id: id
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

var toEntity = function (entity, data, currentUser,action) {
     
    entity.screen_field_id = data.ScreenFieldId;
    entity.account_id = currentUser.AccountId;
    entity.default_name = data.DefaultName;
    entity.updated_name = data.UpdatedName;
    entity.position_level = data.PositionLevel;
    entity.status = data.Status;
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
    var clause = [{ active: true }];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};