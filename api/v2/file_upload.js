"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var log = require("../../api_logs/create_logs");
var logFile = "dsr_summary_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');


exports.all = function(req, res) {


    return res.send("File upload functionality");

};