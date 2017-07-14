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
    }).then(function(account)
    {

           db.product.findAll(
            {
                where : { account_id : account.account_id }
            }).then(function(products)
           {

                 var productIds = products.map(function(product){  return product.product_id; });
                 db.amc.findAll({

                    where : { product_id : {
                        in : productIds
                    }, active:true}

                 }).then(function(amcs)
                 {
                    var items = amcs.map(function(item){  return item.toModel(); });
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
    });;
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.amc.findById(id)
            .then(function (amc) {
                toEntity(amc, Model, req.currentUser,action)
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
        db.amc.build(toEntity({}, Model, req.currentUser,action))
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
    db.amc.find({
        where: {
            amc_id: id,active:true
        },
        include: [
            { all: true }
        ]
    }).then(function (entity) {
        response(res).data(entity.toModel());
    }).catch(function (err) {
        response(res).failure(err);
    });
};


exports.delete = function (req, res) {
    var id = req.params.id;
    db.amc.findById(id)
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
    entity.name = data.Name;
    entity.product_id = data.ProductId;
    entity.account_id = currentUser.AccountId;
    entity.last_updated = new Date().getTime(); 
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }    
    
   
     
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
    var clause = [{ active: true }];
    if (filters.timestamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gt: filters.timestamp } }], [{ 'last_updated': null }, { 'initial_create': { $gt: filters.timestamp } }]));
    }
    callback(null, clause);
};
