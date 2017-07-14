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
            db.account.findAll({
                where: clause || {},
                include: [
                    { all: true }
                ]

            }).then(function (accounts) {
                var items = accounts.map(function (c) {
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
    var action = "";

    var id = req.params.id || Model.serverId;

    if ((id && id != 0)) {
        action = "update";

        db.account.findById(id)
            .then(function (account) {
                toEntity(account, Model, req.currentUser,action)
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
        db.account.build(toEntity({}, Model, req.currentUser,action))
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
    db.account.find({
        where: {
            account_id: id
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
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.account.findById(id)
            .then(function (object) {
                object.active = false;
                object.last_updated = currentTime;
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
    
    entity.organization_id = data.OrganizationId;
    entity.first_name = data.FirstName;
    entity.region_id = data.RegionId;
    entity.subregion_id = data.SubregionId;
    entity.phone_number = data.PhoneNumber;
    entity.email_id = data.EmailId;
    entity.password = data.Password;
     entity.last_updated = new Date().getTime();
    if(action == 'create')
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
   
    entity.financial_year_start = data.FinancialYearStart;
    entity.currency_id = data.CurrencyId;
    entity.start_of_week = data.StartOfWeek;
    entity.number_of_working_days = data.NumberOfWorkingDays;
    entity.default_picklist = data.DefaultPicklist;
    entity.screen_capture_enabled = data.ScreenCaptureEnabled;
    entity.read_only = data.ReadOnly;
    entity.logo_key = data.LogoKey;
    entity.title = data.Title;


   // entity.active = data.Active;
    return entity;
};


var whereClause = function (filters, currentUser, callback) {
    var clause = [{ }, sequelize.literal('(account_id in (SELECT account_id FROM employee WHERE employee_id = ' + currentUser.EmployeeId + '))')];
    if (filters.timestamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
    }
    callback(null, clause);
};