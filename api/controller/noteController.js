"use strict";
var async = require('async');
var moment = require('moment');
var db = require('../../models');

var CreateForm = require('../forms/note').CreateNote;
var UpdateForm = require('../forms/note').UpdateNote;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;

var createNote = function (data, callback) {
    async.waterfall([
        function(wcallback) {
            if (!data.lead.Name)
                return wcallback(null, data.lead);

            db.Lead.findById(data.lead.ServerId)
                .then(function(lead) {

                    wcallback(null, lead);
                })
                .catch(function() {
                    wcallback(err);
                });
        },
        function(lead, wcallback) {
            if (!data.lead.Name)
                lead.id = null;

            if (!data.contact.Name)
                return wcallback(null, lead, data.contact);

            db.Contact.findById(data.contact.ServerId)
                .then(function(contact) {

                    wcallback(null, lead, contact);
                })
                .catch(function() {
                    wcallback(err);
                });
        },
        function(lead, contact, wcallback) {
            if (!data.contact.Name)
                contact.id = null;

            if (!data.meeting.Time)
                return wcallback(null, lead, contact, data.meeting);

            db.Meeting.findById(data.meeting.ServerId)
                .then(function(meeting) {

                    wcallback(null, lead, contact, meeting);
                })
                .catch(function() {
                    wcallback(err);
                });
        },
        function(lead, contact, meeting, wcallback) {
            if (!data.meeting.Time)
                meeting.id = null;

            var Note = db.Note.build({
                text: data.Text,
                addedOn: data.AddedOn,
                EmployeeId: data.currentUserId,
                ContactId: contact.id,
                MeetingId: meeting.id,
                LeadId: lead.id
            });
            Note.save()
                .then(function (note) {
                    wcallback(null , note);
                })
                .catch(function (err) {
                    wcallback(err);
                });
        }
    ],function(err, model){
        if(err)
            return callback(err);
        callback(null,model);
    });
};

var updateNote = function (data, callback) {
    async.waterfall(
        [
            function(wcallback) {
                if (!data.lead.Name)
                    return wcallback(null, data.lead);

                db.Lead.findById(data.lead.ServerId)
                    .then(function(lead) {

                        wcallback(null, lead);
                    })
                    .catch(function() {
                        wcallback(err);
                    });
            },
            function(lead, wcallback) {
                if (!data.lead.Name)
                    lead.id = null;

                if (!data.contact.Name)
                    return wcallback(null, lead, data.contact);

                db.Contact.findById(data.contact.ServerId)
                    .then(function(contact) {

                        wcallback(null, lead, contact);
                    })
                    .catch(function() {
                        wcallback(err);
                    });
            },
            function(lead, contact, wcallback) {
                if (!data.contact.Name)
                    contact.id = null;

                if (!data.meeting.Time)
                    return wcallback(null, lead, contact, data.meeting);

                db.Meeting.findById(data.meeting.ServerId)
                    .then(function(meeting) {

                        wcallback(null, lead, contact, meeting);
                    })
                    .catch(function() {
                        wcallback(err);
                    });
            },
            function (lead, contact, meeting, wcallback) {
                db.Note.findById(data.Id)
                    .then(function (note) {
                        note.text = data.Text;
                        note.addedOn = data.AddedOn;
                        note.ContactId = contact.id;
                        note.MeetingId = meeting.id;
                        note.LeadId = lead.id;

                        note.save()
                            .then(function (note) {
                                wcallback(null, note);
                            })
                            .catch(function (err) {
                                wcallback(err);
                            });
                    })
                    .catch(function (err) {
                        wcallback(err);
                    })
            }
        ],
        function (err, note) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, note);
        }
    );
};

exports.all = function (req, res) {
    db.Note.findAll({
        where:{
            EmployeeId: req.currentUser.id
        },
        include: [{
            all:true
        }]
    })
        .then(function (cs) {
        res.json({
            IsSuccess: true,
            notes: cs.map(function (c) {
                return c.json();
            })
        });
    })
        .catch(function () {
            res.json({
                result: 'ok'
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

            ((form.data.Id != 0) ? updateNote: createNote)(form.data, function (err, note) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess : true,
                    ServerId: note.id
                });
            });
        }
    });
};

exports.getNote = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Note.findById(id).then(function (note) {
        if (!note) {
            res.json({
                result: 'error'
            });
            return;
        }
        res.json({
            result: 'ok',
            data: note.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Note.destroy({
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
            updateNote(data, function (err) {
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

exports.userNotes = function (req, res) {
    var id = req.params.id;
    db.Note.findAll({
        where: {
            EmployeeId: id
        }
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                data: {
                    items: cs.map(function (c) {
                        return c.json();
                    })
                }
            });
        })
        .catch(function () {
            res.json({
                IsSuccess: false
            });
        });
};

exports.unSyncNote = function (req, res) {
    var lastSync = req.params.lastSync;
    var utc =  moment.utc(lastSync);
    db.Note.findAll({
        where: {
            EmployeeId : req.currentUser.id,
            updatedAt : {
                $gt: utc.toDate()
            }
        },
        include: [{
            all:true
        }]
    })
        .then(function (cs) {
            res.json({
                IsSuccess: true,
                notes: cs.map(function (c) {
                    return c.json();
                })
            });
        })
        .catch(function () {
            res.json({
                result: 'ok'
            });
        });
};