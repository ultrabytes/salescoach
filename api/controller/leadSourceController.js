"use strict";
var async = require('async');
var db = require('../../models');

exports.all = function (req, res) {
    db.LeadSource.findAll().then(function (cs) {
        res.json({
            IsSuccess: true,
            data: {
                LeadSource: cs.map(function (c) {
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

exports.getLeadSource = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.LeadSource.findById(id).then(function (lead) {
        if (!lead) {
            res.json({
                result: 'error'
            });
            return;
        }
        res.json({
            result: 'ok',
            data: lead.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};
