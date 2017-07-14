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
             db.region.find(
             {
                where : { region_id : account.region_id }

             }).then(function(entity)
             {
               response(res).data(entity.toModel());

             }).catch(function (err) {
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

    var id = req.params.id || Model.serverId;

    if ((id && id != 0)) {
        db.region.findById(id)
            .then(function (Region) {
                toEntity(Region, Model, req.currentUser)
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
        db.region.build(toEntity({}, Model, req.currentUser))
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
    db.region.find({
        where: {
            region_id: id
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
    entity.iso = data.iso;
    entity.iso3 = data.iso3;
    entity.fips = data.fips;
    entity.country = data.country;
    entity.currency_id = data.currency_id;
    entity.continent = data.continent;
    entity.currency_code = data.currency_code;
    entity.currency_name = data.currency_name;
    entity.phone_prefix = data.phone_prefix;
    entity.postal_code = data.postal_code;
    entity.languages = data.languages;
    entity.geonameid = data.geonameid;
    /*entity.initial_create = data.InitialCreate;
    entity.last_updated = data.LastUpdated;
    entity.active = data.Active;*/
    return entity;
};


/*var whereClause = function (filters, currentUser, callback) {
    var clause = [{ active: true }];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};*/