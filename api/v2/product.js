"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var log = require("../../api_logs/create_logs");
var logFile = "product_log.txt";

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(filters, currentUser, function(err, clause){
        if (err) {
            log.run(req,response(res).customError(err),logFile);
            response(res).failure(err);
        }
        else {
            db.product.findAll({
                where: clause || {},
                include: [
                    { all: true }
                ]

            }).then(function (Industries) {
                var items = Industries.map(function (c) {
                    return c.toModel();
                });

                log.run(req,items,logFile);
                response(res).page(items);
            }).catch(function (err) {
                log.run(req,response(res).customError(err),logFile);
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
        db.product.findById(id)
            .then(function (Product) {
                toEntity(Product, Model, req.currentUser,action)
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
        db.product.build(toEntity({}, Model, req.currentUser,action))
            .save()
            .then(function (entity) {

                log.run(req,entity.toModel(),logFile);
                response(res).data(entity.toModel());
            })
            .catch(function (err) {
                log.run(req,response(res).customError(err),logFile);
                response(res).failure(err);
            });
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.product.find({
        where: {
            product_id: id
        },
        include: [
            {all: true}
        ]
    }).then(function (entity) {
        log.run(req,entity.toModel(),logFile);
        response(res).data(entity.toModel());
    }).catch(function (err) {
        log.run(req,response(res).customError(err),logFile);
        response(res).failure(err);
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.product.findById(id)
            .then(function (object) {
                object.active = false;
                object.save()
                    .then(function (entity) {

                        log.run(req,response(res).returnSuccess(),logFile);
                        response(res).success();
                    })
                    .catch(function (err) {
                        log.run(req,response(res).customError(err),logFile);
                        response(res).failure(err);
                    });
            })
            .catch(function (err) {
                log.run(req,response(res).customError(err),logFile);
                response(res).failure(err);
            });
};

var toEntity = function (entity, data, currentUser,action) {
    
    entity.organization_id = data.OrganizationId;
    entity.account_id = currentUser.AccountId;
    entity.product_name = data.ProductName;
    entity.unit_price = data.UnitPrice;
    entity.margin = data.Margin;
    entity.description = data.Description;
    entity.product_resell = data.ProductResell;
    entity.product_type = data.ProductType;
    entity.brand_name = data.BrandName;
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    
   
    entity.track_as_separate_lead = data.TrackAsSeparateLead;
    entity.active = true;
    
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
    var clause = [{  }, sequelize.literal('(account_id in (SELECT account_id FROM employee WHERE employee_id = ' + currentUser.EmployeeId + '))')];
     clause.push({active: 1});
    if (filters.timestamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
    }
    callback(null, clause);
};