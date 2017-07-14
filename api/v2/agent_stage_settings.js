"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
exports.all = function(req, res){
	var filters = req.query;
    var currentUser = req.currentUser;
    var  AgentRadioResponse = null;

	db.agent_stage_settings.findAll({

		where: { account_id : currentUser.AccountId ,ACTIVE: true },
		include: [{model : db.milestone, where:{active: 1}, required:false},{model: db.agent_radio_response }]
	}).then(function(o){

		 //return res.send(o);

         var items = o.map(function(item){  


         	var tempJson =  item.toModel();
         	if(item.milestones){
         		tempJson.MileStones = item.milestones.map(function(m){
                   return m.toModel();
               });

         	}else{
         		tempJson.MileStones = null;
         	}

         	if(item.agent_radio_response){

                 AgentRadioResponse = item.agent_radio_response.toModel();
			}

               return tempJson;


         });

			res.json({
				success: true,
				ErrorCode : 100,
				message:'completed sucessfully',
				items: items,
                item: AgentRadioResponse,
				ServerCurrentTime: new Date().getTime(),
				recordCount: items.length
			});
	});



};