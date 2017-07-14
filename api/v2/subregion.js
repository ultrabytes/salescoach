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
         where : { employee_id : currentUser.EmployeeId }
    }).then(function(emp)
    {
        db.account.find(
        {
            where : { account_id : emp.account_id }
        }).then(function(account)
        {
             db.subregion.find(
             {
                where : { region_id : account.region_id , subregion_id :  account.subregion_id}

             }).then(function(entity)
             {
               response(res).data(entity.toModel());

             }).catch(function (err) {
                 response(res).failure(err);
             });;
        });
    });
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.subregion.findById(id)
            .then(function (Subregion) {
                toEntity(Subregion, Model, req.currentUser)
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
        db.subregion.build(toEntity({}, Model, req.currentUser))
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
    db.subregion.find({
        where: {
            subregion_id: id
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

var toEntity = function (entity, data, currentUser) {
    entity.region_id = data.region_id;
    entity.name = data.Name;
    entity.timezone = data.timezone;
    //entity.initial_create = data.InitialCreate;
    //entity.last_updated = data.LastUpdated;
    //entity.active = data.Active;
    return entity;
};


var whereClause = function (filters, currentUser, callback) {
    var clause = [{  }];
    /*if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }*/
    callback(null, clause);
};