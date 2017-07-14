"use strict";
var async = require('async');
var db = require('../../models');

exports.all = function (req, res) {
    db.Product.findAll().then(function (cs) {
        res.json({
            IsSuccess: true,
            data: {
                Product: cs.map(function (c) {
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

exports.getProduct = function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.Product.findById(id).then(function (Product) {
        if (!Product) {
            res.json({
                result: 'error'
            });
            return;
        }
        res.json({
            result: 'ok',
            data: Product.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};
