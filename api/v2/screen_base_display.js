"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    db.employee.find({
     attributes : ['account_id'],
     where : { employee_id : currentUser.EmployeeId   }
    }).then(function(emp)
    {
        db.screen_module.findAll(
        {
               attributes : ['screen_module_id'],
               where : { account_id : emp.account_id}
         }).then(function(sc_m)
        {
            
           var screenModuleIds = sc_m.map(function(item){ return item.screen_module_id; });
           db.screen_base_display.findAll(
            {
                where : { screen_module_id : 
                {
                        in : screenModuleIds
                } }
            }).then(function(sb_d)
            {
                var items = sb_d.map(function(item){  return item.toModel(); });
                response(res).page(items);

            }).catch(function(err)
            {
                 response(res).failure(err);
            });
        }).catch(function(err)
        {
            response(res).failure(err);
        });

           
    }).catch(function(err)
    {
         response(res).failure(err);
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.ScreenDisplayId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.screen_base_display.findById(id)
            .then(function (Screen_base_display) {
                toEntity(Screen_base_display, Model, req.currentUser,action)
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
        db.screen_base_display.build(toEntity({}, Model, req.currentUser,action))
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
    db.screen_base_display.find({
        where: {
            screen_display_id: id
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
     
    entity.screen_module_id = data.ScreenModuleId;
    entity.account_id = currentUser.AccountId;
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
    var clause = [{ }];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};