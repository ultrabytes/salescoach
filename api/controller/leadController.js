"use strict";
var async = require('async');
var db = require('../../models');
var _ = require('underscore');
var moment = require('moment');

var CreateForm = require('../forms/lead').CreateLead;
var UpdateForm = require('../forms/lead').UpdateLead;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createLead = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            db.LeadSource.findOrCreate({
                where : {
                    name: data.leadSource.Name
                },
                default: {
                    name: data.leadSource.Name
                }
            }).spread(function(leadSource) {
                if (!leadSource)
                    return wcallback('leadSource already exist');

                wcallback(null, leadSource);
            })
        },
        function(leadSource,wcallback) {
            db.Product.findOrCreate({
                where: {
                    name: data.product.Name
                },
                default: {
                    name: data.product.Name
                }
            }).spread(function (product) {
                if (!product)
                    return wcallback('product already exist');

                wcallback(null,leadSource, product);
            })
        },
        function(leadSource, product, wcallback) {
            if (!data.amc.Name)
                return wcallback(null,leadSource,product, data.amc);

            db.Amc.findOrCreate({
                where: {
                    name: data.amc.Name,
                    ProductId: product.id
                },
                default: {
                    name: data.amc.Name,
                    ProductId: product.id
                }
            }).spread(function (amc) {
                if (!amc)
                    return wcallback('Amc already exist');

                wcallback(null,leadSource,product, amc);
            })
        },
        function(leadSource, product, amc, wcallback) {
            if (!data.organization.Name)
                return wcallback(null,leadSource, product, amc, data.organization);

            db.Organization.find({
                where: {
                    id: data.organization.ServerId,
                    EmployeeId: data.currentUserId
                }
            })
                .then(function(organization) {
                    if (organization) {

                        wcallback(null,leadSource, product ,amc , organization);
                    }
                    else {
                        var organization = db.Organization.build({
                            name: data.organization.Name,
                            address: data.organization.Address,
                            EmployeeId: data.currentUserId
                        });
                        organization.save()
                            .then(function (organization) {

                                wcallback(null, leadSource, product ,amc , organization);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });
                    }
                })
                .catch(function(err) {
                    wcallback(err);
                });
        },
        function(leadSource, product, amc, organization, wcallback) {
            if (!data.organization.Name)
            organization.id = null;

            db.Contact.find({
                where: {
                    id: data.contact.ServerId,
                    EmployeeId: data.currentUserId
                }
            })
                .then(function(contact) {
                    if (contact) {

                        wcallback(null,leadSource, product, amc, organization, contact);
                    }
                    else {
                        var Contact = db.Contact.build({
                            name: data.contact.Name,
                            number: data.contact.Number,
                            email: data.contact.Email,
                            address: data.contact.Address,
                            OrganizationId: organization.id,
                            EmployeeId: data.currentUserId
                        });
                        Contact.save()
                            .then(function (contact) {
                                wcallback(null,leadSource, product, amc, organization, contact);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });
                    }
                })
                .catch(function() {
                    wcallback(err);
                });
        },
        function(leadSource, product, amc, organization, contact, wcallback) {
            if (!data.amc.Name)
                amc.id = null;

            var date = moment(data.ExpectedClosureDate, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');

                var Lead = db.Lead.build({
                    name: data.Name,
                    amount: data.Amount,
                    isWon: data.IsWon,
                    expectedClouserDate: data.ExpectedClosureDate,
                    expectedClouserDateTime: date,
                    isFresh: data.IsFresh,
                    commissionRate: data.CommissionRate,
                    lostReason: data.LostReason,
                    LeadSourceId: leadSource.id,
                    ProductId: product.id,
                    EmployeeId: data.currentUserId,
                    ContactId: contact.id,
                    OrganizationId: organization.id,
                    AmcId: amc.id
                });
                Lead.save()
                    .then(function (lead) {

                        wcallback(null, leadSource, product, amc, organization, contact, lead);
                    })
                    .catch(function (err) {
                        wcallback(err);
                    });
        },
        function(leadSource, product, amc, organization, contact, lead, wcallback) {
            async.eachSeries( data.stateList , function (state, next) {
                var date = moment(state.Date, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                db.State.find(
                    {
                        where: {
                            LeadId: lead.id,
                            name: state.Name,
                            EmployeeId: data.currentUserId
                        }
                    })
                    .then(function(stateModel) {
                        if (stateModel) {
                                stateModel.name = state.Name;
                                stateModel.date = state.Date;
                                stateModel.dateTime = date;
                                stateModel.IsCurrent = state.IsCurrent;

                            stateModel.save()
                                .then(function () {
                                    next();
                                })
                                .catch(function (err) {
                                    next(err);
                                });
                        }
                        else{
                            if (!state)
                                return next(null, lead);

                            var State = db.State.build({
                                name: state.Name,
                                date: state.Date,
                                dateTime: date,
                                IsCurrent: state.IsCurrent,
                                EmployeeId: data.currentUserId,
                                LeadId: lead.id
                            });
                            State.save()
                                .then(function () {
                                    next();
                                })
                                .catch(function (err) {
                                    next(err);
                                });
                        }
                    })
                    .catch(function() {
                        next(err);
                    });
            },function(err){
                if(err)
                    return wcallback(err);
                wcallback(null, lead);
            });
        }
        ],function(err, lead){
            if(err)
                return callback(err);
            callback(null, lead);
        });
};

var updateLead = function (data, callback) {
    async.waterfall(
        [
            function(wcallback) {
                db.LeadSource.findOrCreate({
                    where : {
                        name: data.leadSource.Name
                    },
                    default: {
                        name: data.leadSource.Name
                    }
                }).spread(function(leadSource) {
                    if (!leadSource)
                        return wcallback('leadSource already exist');

                    wcallback(null, leadSource);
                })
            },
            function(leadSource,wcallback) {
                db.Product.findOrCreate({
                    where: {
                        name: data.product.Name
                    },
                    default: {
                        name: data.product.Name
                    }
                }).spread(function (product) {
                    if (!product)
                        return wcallback('product already exist');

                    wcallback(null,leadSource, product);
                })
            },
            function(leadSource, product, wcallback) {
                if (!data.amc.Name)
                    return wcallback(null, leadSource, product, data.amc);

                db.Amc.findOrCreate({
                    where: {
                        name: data.amc.Name,
                        ProductId: product.id
                    },
                    default: {
                        name: data.amc.Name,
                        ProductId: product.id
                    }
                }).spread(function (amc) {
                    if (!amc)
                        return wcallback('Amc already exist');

                    wcallback(null,leadSource,product, amc);
                })
            },
            function(leadSource, product, amc, wcallback) {
                if (!data.organization.Name)
                    return wcallback(null,leadSource, product, amc, data.organization);

                db.Organization.find({
                    where: {
                        id: data.organization.ServerId,
                        EmployeeId: data.currentUserId
                    }
                })
                    .then(function(organization) {
                        if (organization) {

                            wcallback(null,leadSource, product ,amc , organization);
                        }
                        else {
                            var organization = db.Organization.build({
                                name: data.organization.Name,
                                address: data.organization.Address,
                                EmployeeId: data.currentUserId
                            });
                            organization.save()
                                .then(function (organization) {

                                    wcallback(null, leadSource, product ,amc , organization);
                                })
                                .catch(function (err) {
                                    wcallback(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        wcallback(err);
                    });
            },
            function(leadSource, product, amc, organization, wcallback) {
                if (!data.organization.Name)
                    organization.id = null;

                db.Contact.find({
                    where: {
                        id: data.contact.ServerId,
                        EmployeeId: data.currentUserId
                    }
                })
                    .then(function(contact) {
                        if (contact) {

                            wcallback(null,leadSource, product, amc, organization, contact);
                        }
                        else {
                            var Contact = db.Contact.build({
                                name: data.contact.Name,
                                number: data.contact.Number,
                                email: data.contact.Email,
                                address: data.contact.Address,
                                OrganizationId: organization.id,
                                EmployeeId: data.currentUserId
                            });
                            Contact.save()
                                .then(function (contact) {
                                    wcallback(null,leadSource, product, amc, organization, contact);
                                })
                                .catch(function (err) {
                                    wcallback(err);
                                });
                        }
                    })
                    .catch(function() {
                        wcallback(err);
                    });
            },
            function (leadSource, product, amc, organization, contact, wcallback) {
                var date = moment(data.ExpectedClosureDate, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                db.Lead.findById(data.Id)
                    .then(function (lead) {
                        lead.name = data.Name;
                        lead.amount= data.Amount;
                        lead.isWon= data.IsWon;
                        lead.expectedClouserDate=data.ExpectedClosureDate;
                        lead.expectedClouserDateTime=date;
                        lead.isFresh= data.IsFresh;
                        lead.commissionRate= data.CommissionRate;
                        lead.lostReason= data.LostReason;
                        lead.LeadSourceId = leadSource.id;
                        lead.ProductId = product.id;
                        lead.ContactId = contact.id;
                        lead.OrganizationId = organization.id;
                        lead.AmcId = amc.id;

                        lead.save()
                            .then(function (lead) {
                                wcallback(null,leadSource, product, amc, organization, contact, lead);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });

                }).catch(function (err) {
                    wcallback(err);
                });
            },
            function (leadSource, product, amc, organization, contact, lead, wcallback) {
                async.eachSeries( data.stateList , function (state, next) {
                    var date = moment(state.Date, "DD MMM, YYYY").format('YYYY-MM-DD 00:00:00');
                    db.State.find(
                        {
                            where: {
                                LeadId: lead.id,
                                name: state.Name,
                                EmployeeId: data.currentUserId
                            }
                        })
                        .then(function(stateModel) {
                            if (stateModel) {
                                stateModel.name = state.Name;
                                stateModel.date = state.Date;
                                stateModel.dateTime = date;
                                stateModel.IsCurrent = state.IsCurrent;

                                stateModel.save()
                                    .then(function () {
                                        next();
                                    })
                                    .catch(function (err) {
                                        next(err);
                                    });
                            }
                            else{
                                if (!state)
                                    return next(null, lead);

                                var State = db.State.build({
                                    name: state.Name,
                                    date: state.Date,
                                    dateTime: date,
                                    IsCurrent: state.IsCurrent,
                                    EmployeeId: data.currentUserId,
                                    LeadId: lead.id
                                });
                                State.save()
                                    .then(function () {
                                        next();
                                    })
                                    .catch(function (err) {
                                        next(err);
                                    });
                            }
                        })
                        .catch(function() {
                            next(err);
                        });
                },function(err){
                    if(err)
                        return wcallback(err);
                    wcallback(null, lead);
                });
            }
        ],
        function (err ,lead) {
            if (err) {
                callback(err);
                return;
            }
            callback(null ,lead);
        }
    );
};

exports.all = function (req, res) {
        db.Lead.findAll({
            where:{
                EmployeeId: req.currentUser.id
            },
            include: [
                { all: true }
            ]
        })
            .then(function (cs) {
                res.json({
                    IsSuccess:  true,
                    lead: cs.map(function (c) {
                        return c.jsonLead();
                    })
                });
            })
            .catch(function () {
                res.json({
                    IsSuccess: false
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

            ((form.data.Id != 0) ? updateLead: createLead)(form.data, function (err, lead) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true,
                    ServerId: lead.id
                });
            });
        }
    });
};

exports.getLead = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Lead.findAll({
        where:{
            id: id
        },
        include: [
            { all: true },
            {
                model: db.Meeting,
                include: [db.MeetingType]
            }
        ]
    })
        .then(function (cs) {
            res.json({
                success: true,
                lead: cs.map(function (c) {
                    return c.jsonLeadWithMeetingAndNotes();
                })
            });
        })
        .catch(function (err) {
            res.json({
                result: 'error'
            });
        });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Lead.destroy({
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
            updateLead(data, function (err) {
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

exports.teamLeads = function (req, res) {
    var stage = req.params.stage;
    db.Team.findAll({
        where: {
            supervisorId :  req.currentUser.id
        }
    }).then(function (members) {
        var employeeIds = [];
        _.each(members, function(member) {
            employeeIds.push(member.json().memberId);
        });

    db.State.findAll({
        where: {
            name: stage,
            IsCurrent: true,
            EmployeeId: {$in: employeeIds}
        },
        include : [{
            model: db.Lead,
            include: [
                {model: db.Contact},
                {model: db.Employee}
            ]
        }]
    })
        .then(function (cs) {
            res.json({
                success: true,
                lead: cs.map(function (c) {
                    return c.Lead.jsonTeamLead();
                })
            });
        })
        .catch(function () {
            res.json({
                IsSuccess: false
            });
        });
    });
};

exports.LeadsByContactId = function (req, res) {
    var id = req.params.id;
        db.Contact.find({
            where:{
                id : id
            },
            include: [{
                    model: db.Lead,
                    include: [{
                            model: db.Employee
                        },
                        {
                            model: db.State
                        },
                        {
                            model: db.Contact
                        }
                    ]
                }
            ]
        })
            .then(function (contact) {
                res.json({
                    success: true,
                    lead: contact.Leads.map(function(lead){
                       return lead.jsonLeadByContOrgId();
                    })
                });
            })
            .catch(function (err) {
                res.json({
                    IsSuccess: false,
                    message: err
                });
            });
};

exports.leadByOrganizationId = function (req, res) {
    var id = req.params.id;
    db.Organization.find({
        where:{
            id : id
        },
        include: [{
            model: db.Lead,
            include: [{
                    model: db.Employee
                },
                {
                    model: db.State
                },
                {
                    model: db.Contact
                }
            ]
        }
        ]
    })
        .then(function (organization) {
            res.json({
                success: true,
                lead: organization.Leads.map(function(lead){
                    return lead.jsonLeadByContOrgId();
                })
            });
        })
        .catch(function (err) {
            res.json({
                IsSuccess: false,
                message: err
            });
        });
};

exports.unSyncLead = function (req, res) {
    var lastSync = req.params.lastSync;
    var utc =  moment.utc(lastSync);
    db.Lead.findAll({
        where: {
            EmployeeId : req.currentUser.id,
            updatedAt : {
                $gt: utc.toDate()
            }
        },
        include: [
            { all: true }
        ]
    })
        .then(function (cs) {
            res.json({
                IsSuccess:  true,
                lead: cs.map(function (c) {
                    return c.jsonLead();
                })
            });
        })
        .catch(function () {
            res.json({
                IsSuccess: false
            });
        });
};