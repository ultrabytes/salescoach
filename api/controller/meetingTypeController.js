"use strict";
var async = require('async');
var db = require('../../models');

exports.all = function (req, res) {
    db.MeetingType.findAll().then(function (cs) {
        res.json({
            IsSuccess: true,
            data: {
                MeetingType: cs.map(function (c) {
                    return c.json();
                })
            }
        });
    })
        .catch(function () {
            res.json({
                result: 'ok'
            });
        });
};

exports.getMeetingType = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.MeetingType.findById(id).then(function (meetingType) {
        if (!meetingType) {
            res.json({
                result: 'error'
            });
            return;
        }
        res.json({
            result: 'ok',
            data: meetingType.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};
