"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var log = require("../../api_logs/create_logs");
var logFile = "product_settings_log.txt";

exports.all = function (req, res) {

    var filters = req.query;
    var currentUser = req.currentUser;

    db.product_settings.findAll({

        where: {account_id : filters.account_id}
    }).then(function(productSettings){

    	var items = productSettings.map(function (c) {
                    return c.toModel();
         });

        log.run(req,items,logFile);

    	response(res).page(items);



    }).catch(function(err){
        log.run(req,response(res).customError(err),logFile);
    	response(res).failure(err);
    });
};