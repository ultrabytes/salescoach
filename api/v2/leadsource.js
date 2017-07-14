"use strict";
var response = require('../../helpers/response');

var sequelize = require('sequelize');

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    whereClause(filters,currentUser,function(err,q,limit,offset){
       if (err) {
            response(res).failure(err);
       }

       db.leadsource.findAndCountAll({

         where : q || {},
         include: [
                    {all: true}
         ],
         limit: limit , offset: offset,
         order: [["last_updated","ASC"]]
       }).then(function(leadsources)
       {

         var items = leadsources.rows.map(function (c) {
              return c.toModel();
         });

        var moreRecordsAvailable = false;

        if(leadsources.count > leadsources.rows.length)
        {
            moreRecordsAvailable = true;
        }

            res.json({
                success: true,
                ErrorCode : 100,
                message: 'completed sucessfully',
                items: items,
                recordCount: items.length,
                ServerCurrentTime: new Date().getTime(),
                moreRecordsAvailable: moreRecordsAvailable
            });



       }).catch(function(err){

             response(res).failure(err);
       });

    });
   
};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;
    var action = "";

    if ((id && id != 0)) {
        action = "update";
        db.leadsource.findById(id)
            .then(function (leadsource) {
                toEntity(leadsource, Model, req.currentUser,action)
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
        db.leadsource.build(toEntity({}, Model, req.currentUser,action))
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
    db.leadsource.find({
        where: {
            lead_source_id: id
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
    var currentTime = new Date().getTime();
    var id = req.params.id;
    db.leadsource.findById(id)
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
    entity.name = data.Name;
    entity.last_updated = new Date().getTime();
    entity.account_id = currentUser.AccountId;
    if(action == "create")
    {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }
    
    // entity.active = data.Active;
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
     var q = null;
     var limit = 5;
     var offset = 0;
     q = { account_id : currentUser.AccountId };
     if(filters.timestamp)
     {
        q = { account_id : currentUser.AccountIds,last_updated : { $gt : filters.timestamp } };
     }

     callback(null,q,limit,offset);



};