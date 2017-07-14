"use strict";
var async = require('async');
var db = require('../../models');

exports.all = function (req, res) {
    db.Amc.findAll().then(function (cs) {
        res.json({
            IsSuccess: true,
            data: {
                Amc: cs.map(function (c) {
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

exports.getAmc = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Amc.findById(id).then(function (amc) {
        if (!amc) {
            res.json({
                result: 'error'
            });
            return;
        }
        res.json({
            result: 'ok',
            data: amc.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};
