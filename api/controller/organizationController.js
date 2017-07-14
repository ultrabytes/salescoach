"use strict";
var async = require('async');
var moment = require('moment');
var _ = require('underscore');
var db = require('../../models');

var CreateForm = require('../forms/organization').CreateOrganization;
var UpdateForm = require('../forms/organization').UpdateOrganization;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createOrganization = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            var organization = db.Organization.build({
                    name: data.Name,
                    address: data.Address,
                    EmployeeId: data.currentUserId
                });
                organization.save()
                    .then(function (organization) {
                        wcallback(null, organization);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
        }
    ],function(err, organization){
                if(err)
                    return callback(err);
                callback(null, organization);
            });
        };

var updateOrganization = function (data, callback) {
    async.waterfall(
        [
            function (wcallback) {
                db.Organization.findById(data.Id).then(function (Organization) {
                    if (!Organization) {
                        wcallback("Cannot Find organization");
                        return;
                    }
                    wcallback(null, Organization);
                }).catch(function (err) {
                    wcallback(err);
                });
            },
            function (organization, wcallback) {
                organization.name = data.Name;
                organization.address = data.Address;

                organization.save()
                    .then(function (organization) {
                        wcallback(null, organization);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            }
        ],
        function (err, organization) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, organization);
        }
    );
};

exports.all = function (req, res) {
    db.Organization.findAll({
        where:{
            EmployeeId: req.currentUser.id
        },
        include: [db.Contact]
    })
        .then(function (cs) {
        res.json({
            success: true,
            organization: cs.map(function (c) {
                    return c.json();
            })
        });
    })
        .catch(function () {
            res.json({
                success: 'false'
            });
        });
};

exports.team = function (req, res) {
    db.Team.findAll({
        where: {
            supervisorId :  req.currentUser.id
        }
    }).then(function (members) {
        var employeeIds = [];
        _.each(members, function(member) {
            employeeIds.push(member.json().memberId);
        });

    db.Organization.findAll({
        where:{
            EmployeeId: {$in: employeeIds}
        },
        include: [db.Contact]
    })
        .then(function (cs) {
            res.json({
                success: true,
                organization: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function () {
            res.json({
                success: 'false'
            });
        });
    });
};

exports.create = function (req, res) {
    console.log(req.body);
    CreateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            form.data.currentUserId = req.currentUser.id;
            form.data.Id = req.body.ServerId;

            ((form.data.Id != 0) ? updateOrganization  : createOrganization)(form.data, function (err, organization) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true,
                    ServerId: organization.id
                });
            });
        }
    });
};

exports.getOrganization = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Organization.find({
            where: {
                id : id
            },
            include: [db.Contact]
        }
    )
        .then(function (organization) {
        if (!organization) {
            res.json({
                IsSuccess : false
            });
            return;
        }
        res.json({
            IsSuccess : true ,
            organization: organization.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Organization.destroy({
        where: {
            id: id
        }
    }).then(function () {
        res.json({
            result: 'ok'
        });
    }).catch(function () {
        res.json({
            result: 'error'
        });
    });
};

exports.unSyncOrganization = function (req, res) {
    var lastSync = req.params.lastSync;
    var utc =  moment.utc(lastSync);
    db.Organization.findAll({
        where: {
            EmployeeId : req.currentUser.id,
            createdAt : {
                $gt: utc.toDate()
            }
        },
        include: [db.Contact]
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                organization: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function () {
            res.json({
                IsSuccess: false
            });
        });
};

exports.update = function (req, res) {
    var id = req.params.id;
    console.log(req.body);
    UpdateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            var data = form.data;
            data.id = id;
            updateOrganization(data, function (err) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true
                });
            });
        }
    });
};