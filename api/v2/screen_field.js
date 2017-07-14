"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;

    db.screen_field.findAll({

       where: {account_id: currentUser.AccountId},
       include: [{ model: db.screen_field_master }]
    }).then(function(sf){
        // res.send(sf);
         // console.log("Account Id--------------->"+currentUser.AccountId);
         var items = sf.map(function(i){

               var tempJson =  i.toModel();
               if(i.screen_field_master){
                   tempJson.ScreenFieldMaster = i.screen_field_master.toModel();
               }else{

                  tempJson.ScreenFieldMaster = null;
               }

               return tempJson;

         });

         response(res).page(items);

    }).catch(function(err){

           response(res).failure(err);
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.ScreenFieldId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.screen_field.findById(id)
            .then(function (Screen_field) {
                toEntity(Screen_field, Model, req.currentUser,action)
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
        db.screen_field.build(toEntity({}, Model, req.currentUser,action))
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
    db.screen_field.find({
        where: {
            screen_field_id: id
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
    entity.screen_display_id = data.ScreenDisplayId;
    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
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