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
            db.screen_module.findAll({
               where : {account_id : currentUser.AccountId, last_updated: { $gte: filters.timestamp || 0 } },
               include:[
                   {model:db.screen_module_master,where:{status: 1}}
                   //{model:db.screen_field, where: {active: 1}, required:false,include: [{model: db.screen_field_master }]}


               ]

            }).then(function (Screen_module) {
               // res.send(Screen_module);
                var items = Screen_module.map(function (c) {
                    var tempJson = c.toModel();
                    if(c.screen_module_master){
                        tempJson.ScreenModuleMaster = c.screen_module_master.toModel();
                    }else{
                        tempJson.ScreenModuleMaster = null;
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

    var id = req.params.id || Model.ScreenModuleId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.screen_module.findById(id)
            .then(function (Screen_module) {
                toEntity(Screen_module, Model, req.currentUser,action)
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
        db.screen_module.build(toEntity({}, Model, req.currentUser,action))
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
    db.screen_module.find({
        where: {
            screen_module_id: id
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
    db.screen_module.findById(id)
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
    entity.status = data.Status;
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
    var clause = [{  }, sequelize.literal('(account_id in (SELECT account_id FROM employee WHERE employee_id = ' + currentUser.EmployeeId + '))')];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};