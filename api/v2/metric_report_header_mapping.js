"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var log = require("../../api_logs/create_logs");
var logFile = "dsr_summary_log.txt";

exports.all = function(req, res){

    var filters = req.query;
    var currentUser = req.currentUser;

    db.metric_report_header_mapping.findAll({
        where: {Status: 1}
    }).then(function(ob){
        var items = ob.map(function(o){
            return o.toModel();
        });
        response(res).page(items);

    }).catch(function(err){
        response(res).failure(err);
    });


};