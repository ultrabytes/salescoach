"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
exports.all = function(req, res){
	var filters = req.query;
    var currentUser = req.currentUser;

	db.lead_status_setting.findAll({

		where: { account_id : currentUser.AccountId  }
	}).then(function(lss){

         var items = lss.map(function(item){  return item.toModel(); });
         response(res).page(items);
	});



};