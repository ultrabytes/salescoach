"use strict";
var response = require('../../helpers/response');
var sequelize = require('sequelize');
var moment = require('moment');
//// console.log(new Date().getTime());

exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;
    if(filters.timestamp)
    {

              db.employee.find(
            {
                attributes: ['account_id'],
                where : { employee_id : currentUser.EmployeeId }
            }).then(function(Emp)
             {
                
                db.meetingtype.findAll(
                {
                    where : { account_id :Emp.account_id, initial_create : 
                     {
                        gte : filters.timestamp
                     }}

                }).then(function(mTypes)
                {
                     var items = mTypes.map(function(item){ return item.toModel();  });
                     response(res).page(items);
                     
                }).catch(function(err)
                {
                     response(res).failure(err);
                });

            }).catch(function(err)
            {
                response(res).failure(err);
            });
       
    
    }else
    {
    
         
                 db.employee.find(
            {
                attributes: ['account_id'],
                where : { employee_id : currentUser.EmployeeId }
            }).then(function(Emp)
             {
                
                db.meetingtype.findAll(
                {
                    where : { account_id : Emp.account_id}

                }).then(function(mTypes)
                {
                     var items = mTypes.map(function(item){ return item.toModel();  });
                     response(res).page(items);
                     
                }).catch(function(err)
                {
                     response(res).failure(err);
                });

            }).catch(function(err)
            {
                response(res).failure(err);
            });
          
    }
    
};

exports.update = function(req,res)
{
   var id =  req.params.id;
   var body = req.body;
   body.last_updated = new Date().getTime();
   
   db.meetingtype.update(body,{

            where: {
                meeting_type_id : req.params.id

            }

        }).then(function(items)
        {
            // res.json({
            //     Success : true,
            //     info : "meeting type updated successfully."
            // });

            db.meetingtype.find(
            {
                where : { meeting_type_id : req.params.id }

            }).then(function(entity)
            {
               response(res).data(entity.toModel());
            });
        }).catch(function(err)
        {
             response(res).failure(err);
        });
}

exports.createOrUpdate = function (req, res) {
    var Model = req.body;

    var id = req.params.id || Model.serverId;

    if ((id && id != 0)) {
        // console.log("put Request");
        db.meetingtype.findById(id)
            .then(function (Meetingtype) {
                toEntity(Meetingtype, Model, req.currentUser)
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
        db.meetingtype.build(toEntity({}, Model, req.currentUser))
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
    db.meetingtype.find({
        where: {
            meeting_type_id: id
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

    db.meetingtype.findById(id)
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


var toEntity = function (entity, data, currentUser) {
    entity.type = data.type;
    entity.account_id = currentUser.AccountId;
    entity.initial_create = new Date().getTime();
    entity.last_updated = new Date().getTime();
   // entity.active = data.Active;
    return entity;
};

var whereClause = function (filters, currentUser, callback) {
    var clause = [{  }];
    if (filters.timeStamp) {
        clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    }
    callback(null, clause);
};