"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.all = function (req, res) {
	var filters = req.query;
    var currentUser = req.currentUser;
    db.screen_field_master.findAll({
    	
    }).then(function(sfm){
       
         var items = sfm.map(function(i){
         	   return i.toModel();
         });

         response(res).page(items);

    });
};