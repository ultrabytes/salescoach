"use strict";
var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var db = require('../../models');

var CreateForm = require('../forms/contact').CreateContact;
var UpdateForm = require('../forms/contact').UpdateContact;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createContact = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            if (!data.organization.Name)
                return wcallback(null, data.organization);

            db.Organization.findById(data.organization.ServerId)
                .then(function (organization) {
                    wcallback(null, organization);
                })
                .catch(function (err) {
                    wcallback(err);
                });
        },
        function(organization, wcallback) {
            if (!data.organization.Name){
                organization.id = null;

                var Contact = db.Contact.build({
                    name: data.Name,
                    number: data.Number,
                    email: data.Email,
                    address: data.Address,
                    isLink: false,
                    OrganizationId: organization.id,
                    EmployeeId: data.currentUserId
                });
                Contact.save()
                    .then(function (contact) {
                        wcallback(null, contact);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            }
            else {
                db.Contact.find({
                    where: {
                        OrganizationId: organization.id,
                        EmployeeId: data.currentUserId,
                        isLink: true
                    }
                })
                    .then(function(contact) {
                        if(!contact){
                            var Contact = db.Contact.build({
                                name: data.Name,
                                number: data.Number,
                                email: data.Email,
                                address: data.Address,
                                isLink: true,
                                OrganizationId: organization.id,
                                EmployeeId: data.currentUserId
                            });
                            Contact.save()
                                .then(function (contact) {
                                    wcallback(null, contact);
                                })
                                .catch(function (err) {
                                    wcallback(err);
                                });
                        }
                        else {
                            var Contact = db.Contact.build({
                                name: data.Name,
                                number: data.Number,
                                email: data.Email,
                                address: data.Address,
                                isLink: false,
                                OrganizationId: organization.id,
                                EmployeeId: data.currentUserId
                            });
                            Contact.save()
                                .then(function (contact) {
                                    wcallback(null, contact);
                                })
                                .catch(function (err) {
                                    wcallback(err);
                                });
                        }
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            }
        }
    ],function(err, model){
            if(err)
                return callback(err);

            callback(null,model);
});
};

var updateContact = function (data, callback) {
    async.waterfall(
        [
            function(wcallback) {
                if (!data.organization.Name)
                    return wcallback(null, data.organization);

                db.Organization.findById(data.organization.ServerId)
                    .then(function (organization) {
                        wcallback(null, organization);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
            },
            function (organization, wcallback) {
                if (!data.organization.Name){
                    organization.id = null;

                    db.Contact.findById(data.Id).then(function (contact) {
                        contact.name = data.Name;
                        contact.number = data.Number;
                        contact.email = data.Email;
                        contact.address = data.Address;
                        contact.isLink = false;
                        contact.OrganizationId = organization.id;

                       contact.save()
                            .then(function (contact) {
                                wcallback(null, contact);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });
                    })
                }
                else {
                    db.Contact.find({
                        where: {
                            OrganizationId: organization.id,
                            EmployeeId: data.currentUserId,
                            isLink: true
                        }
                    })
                        .then(function(contact) {
                            if(!contact){
                                db.Contact.findById(data.Id).then(function (contact) {
                                    contact.name = data.Name;
                                    contact.number = data.Number;
                                    contact.email = data.Email;
                                    contact.address = data.Address;
                                    contact.isLink = true;
                                    contact.OrganizationId = organization.id;

                                    contact.save()
                                        .then(function (contact) {
                                            wcallback(null, contact);
                                        })
                                        .catch(function (err) {
                                            wcallback(err);
                                        });
                                })
                            }
                            else {
                                db.Contact.findById(data.Id).then(function (contact) {
                                    contact.name = data.Name;
                                    contact.number = data.Number;
                                    contact.email = data.Email;
                                    contact.address = data.Address;
                                    contact.isLink = false;
                                    contact.OrganizationId = organization.id;

                                    contact.save()
                                        .then(function (contact) {
                                            wcallback(null, contact);
                                        })
                                        .catch(function (err) {
                                            wcallback(err);
                                        });
                                })
                            }
                        })
                        .catch(function (err) {
                            wcallback(err);
                        });
                }
            }
        ],
        function (err, contact) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, contact);
        }
    );
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

        db.Contact.findAll({
            where:{
                EmployeeId: {$in: employeeIds}
            },
            include: [db.Organization]

        }).then(function (cs) {
            res.json({
                success: true,
                contact: cs.map(function (c) {
                    return c.json();
                })
            });
        }).catch(function () {
            res.json({
                result: 'error'
            });
        });
    });
};

exports.all = function (req, res) {
    db.Contact.findAll({
        where:{
            EmployeeId: req.currentUser.id
        },
        include: [db.Organization]
    })
        .then(function (cs) {
            res.json({
                success: true,
                contact: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function () {
            res.json({
                result: 'error'
            });
        });
};

exports.unSyncContact = function (req, res) {
    var lastSync = req.params.lastSync;
    var utc =  moment.utc(lastSync);
    db.Contact.findAll({
        where: {
            EmployeeId : req.currentUser.id,
            updatedAt : {
                $gt: utc.toDate()
            }
        },
        include:  [db.Organization]
    })
        .then(function (cs) {
            res.json({
                success: true,
                contact: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function (err) {
            res.json({
                success: false
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

            ((form.data.Id != 0) ? updateContact : createContact)(form.data, function (err, contact) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true,
                    ServerId: contact.id
                });
            });
        }
    });
};

exports.getContact = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Contact.find({
         where: {
             id: id
         },
        include:[
            {all:true},
            {
                model: db.Meeting,
                include: [db.MeetingType]
            },
            {
                model: db.Task
            },
            {
                model: db.Note
            }
        ]
    })
        .then(function (contact) {
        if (!contact) {
            res.json({
                IsSuccess: false
            });
            return;
        }
        res.json({
            success: true,
            contactModel: contact.jsonWithNotesAndMeeting()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Contact.destroy({
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

exports.update = function (req, res) {
    var id = req.params.id;
    console.log(req.body);
    UpdateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            var data = form.data;
            data.id = id;
            updateContact(data, function (err) {
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