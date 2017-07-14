"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(filters, currentUser, function(err, clause,q,limit,offset){
        if (err) {
            response(res).failure(err);
        }
        else {
              
            db.access_level.findAndCountAll({
                where: q || {},
                include: [
                    { all: true }
                ],
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]
            }).then(function (access_levels) {
                
                var items = access_levels.rows.map(function (c) {
                    return c.toModel();
                });
                var moreRecordsAvailable = false;

                if(access_levels.count > access_levels.rows.length)
                {
                     moreRecordsAvailable = true;
                }

              
               //response(res).page(items);
               res.json({
                success: true,
                ErrorCode : 100,
                message: 'completed sucessfully',
                items: items,
                recordCount: items.length,
                ServerCurrentTime: new Date().getTime(),
                moreRecordsAvailable: moreRecordsAvailable
            });


            }).catch(function (err) {
                response(res).failure(err);
            });
        }
    });
};

exports.createOrUpdate = function (req, res) {

     var accessLevelModel = req.body;
     //res.send(accessLevelModel);


    var id = req.params.id || accessLevelModel.AccessId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.access_level.findById(id)
            .then(function (accessLevel) {
                toEntity(accessLevel, accessLevelModel, req.currentUser,action)
                    .save()
                    .then(function (entity) {
                        response(res).data(entity.toModel(req.currentUser));
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
        db.access_level.build(toEntity({}, accessLevelModel, req.currentUser,action))
            .save()
            .then(function (entity) {
                response(res).data(entity.toModel(req.currentUser));
            })
            .catch(function (err) {
                response(res).failure(err);
            });
    }
    
};

exports.get = function (req, res) {

    var id = req.params.id;
    db.access_level.find({
        where: {
            access_id: id
        },
        include: [
            {all: true},
        ]
    }).then(function (entity) {
        response(res).data(entity.toModel(req.currentUser));
    }).catch(function (err) {
        response(res).failure(err);
    });


    
};

exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.access_level.findById(id)
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

var toEntity = function(entity,data,currentUser,action)
{
   entity.employee_id = data.EmployeeId;
   entity.description = data.Description;
   entity.account_id = currentUser.AccountId;
   entity.accessible_role_ids = data.accessible_role_ids;
   entity.access_level = data.AccessLevel;
   entity.delete_access = data.DeleteAccess;
   entity.last_updated = new Date().getTime();
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }

    return entity;


}; 


var whereClause = function (filters, currentUser, callback) {
     var clause = [{  }];
     var empArray = [];
     var emp = null;
     var q = null;
     var limit = 5;
     var offset = 0;

    q = { employee_id : currentUser.EmployeeId };

    if(filters.timestamp)
    {
                         
        q = { employee_id : currentUser.EmployeeId, last_updated : { $gt : filters.timestamp } };

     }

    callback(null, clause,q,limit,offset);


    
   
};



