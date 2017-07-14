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
        db.account.find(
        {
           attributes: ['industry_id'],
           where : { account_id : emp.account_id}
        }).then(function(account)
        {
            db.product_industry_mapping.findAndCountAll(
            {
              where : { industry_id : account.industry_id,active:true }
            }).then(function(pim)
            {
                    res.json({
                    success: true,
                    ErrorCode: 100,
                    message: 'completed sucessfully',
                    items: pim.rows,
                    recordCount:pim.count
                    });

            }).catch(function (err) {
                        response(res).failure(err);
            });;
        }).catch(function (err) {
                        response(res).failure(err);
        });
    }).catch(function (err) {
                        response(res).failure(err);
     });;
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.product_industry_mapping.findById(id)
            .then(function (Product_industry_mapping) {
                toEntity(Product_industry_mapping, Model, req.currentUser,action)
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
        db.product_industry_mapping.build(toEntity({}, Model, req.currentUser,action))
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
    db.product_industry_mapping.find({
        where: {
            product_industry_mapping_id: id,active:true
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

    entity.product_id = data.ProductId;
    entity.industry_id = data.IndustryId;
    entity.account_id = currentUser.AccountId;
    entity.description = data.Description;     
    entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    
    //entity.active = data.Active;
    
    return entity;
};


exports.delete = function (req, res) {
    var id = req.params.id;
    db.product_industry_mapping.findById(id)
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


var whereClause = function (filters, currentUser, callback) {
    var clause = [{ active: true }];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};