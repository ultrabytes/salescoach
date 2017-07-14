"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;

    // db.employee.find({
    //      where : { employee_id : currentUser.EmployeeId }
    // }).then(function(emp)
    // {
        db.account.find(
        {
            where : { account_id : currentUser.AccountId }
        }).then(function(account)
        {
             db.currency.find(
             {
                where : { currency_id : account.currency_id , active: true}

             }).then(function(entity)
             {
               response(res).data(entity.toModel());

             }).catch(function (err) {
                 response(res).failure(err);
             });;
        });
    // });

    
   
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;

    if ((id && id != 0)) {
        db.currency.findById(id)
            .then(function (Currency) {
                toEntity(Currency, Model, req.currentUser)
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
        db.currency.build(toEntity({}, Model, req.currentUser))
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
    db.currency.find({
        where: {
            currency_id: id,active:true
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
    db.currency.findById(id)
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

var toEntity = function (entity, data, currentUser) {
    entity.currency_code = data.CurrencyCode;
    entity.currency_name = data.CurrencyName;
    return entity;
};

/*var whereClause = function (filters, currentUser, callback) {
    var clause = [{active:true}];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};*/
