"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
exports.all = function (req, res) {
    var filters = req.query;
    var currentUser = req.currentUser;

    db.lead_indicator_msg_setting.findAll({
        where: {role_id: currentUser.RoleId, account_id: currentUser.AccountId}
    }).then(function (o) {

        var items = [];

        async.forEachSeries(o, function (i, callback) {

            var lSetting = i.toModel();

            if (i.segmented == 0) {

                getMessages(req, res, i, function (possitiveMessages, negativeMessages) {

                    lSetting.PossitiveMessages = possitiveMessages;
                    lSetting.NegativeMessages = negativeMessages;

                    items.push(lSetting);
                    callback();

                });

            } else {
                getSegmentedResponse(req, res, i, function (sMessageObject) {

                    lSetting.PossitiveMessages = [];
                    lSetting.NegativeMessages = [];
                    lSetting.SegmentedTableInfos = sMessageObject;
                    items.push(lSetting);
                    callback();


                });

            }


        }, function (err) {
            if (err) return next(err);
            response(res).page(items);
        });


    }).catch(function (err) {

        response(res).failure(err);
    });


};

var getMessages = function (req, res, i, cb) {

    var pS = i.positive_message_ids;
    var nS = i.negative_message_ids;

    var pA = pS.split(',');
    var nA = nS.split(',');

    db.lead_indicator_msg_master.findAll({
        where: {message_id: {in: pA}}
    }).then(function (p) {

        db.lead_indicator_msg_master.findAll({
            where: {message_id: {in: nA}}
        }).then(function (n) {

            var pMO = p.map(function (pi) {

                return pi.toModel();
            });

            var nMO = n.map(function (ni) {
                return ni.toModel();
            });

            cb(pMO, nMO);

        }).catch(function (err) {
            response(res).failure(err);
        });

    }).catch(function (err) {
        response(res).failure(err);
    });


};

var getMessagesForSegmentType = function (req, res, i, cb) {

    var uT = i.upper_target_msg_ids;
    var lT = i.lower_target_msg_ids;

    var uA = uT.split(',');
    var lA = lT.split(',');

    db.lead_indicator_msg_master.findAll({
        where: {message_id: {in: uA}}
    }).then(function (u) {

        db.lead_indicator_msg_master.findAll({
            where: {message_id: {in: lA}}
        }).then(function (l) {

            var lMO = l.map(function (li) {

                return li.toModel();
            });

            var uMO = u.map(function (ui) {
                return ui.toModel();
            });

            cb(lMO, uMO);

        }).catch(function (err) {
            response(res).failure(err);
        });

    }).catch(function (err) {
        response(res).failure(err);
    });


};


var getSegmentedResponse = function (req, res, i, cb2) {


    db.lead_indicator_msg_segmented.findAll({
        where: {setting_id: i.setting_id}
    }).then(function (sm) {

        var items = [];

        async.forEach(sm, function (item, callback) {

            var segResponse = item.toModel();

            getMessagesForSegmentType(req, res, item, function (lm, um) {
                segResponse.LowerTargetMessages = lm;
                segResponse.UpperTargetMessages = um;

                items.push(segResponse);
                callback();

            });

        }, function (err) {

            cb2(items);

        });


    }).catch(function (err) {
        response(res).failure(err);
    });

};