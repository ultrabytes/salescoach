"use strict";
var _ = require('underscore');
var moment = require('moment');
var async = require('async');
var response = require('../../helpers/response');

exports.search = function(req, res){
    var date = req.params.date;
    var period = req.params.period;
    var filters = req.query;
    var currentUser = req.currentUser;

    whereClause(filters, currentUser, function (err, clause) {
        if (err) {
            response(res).failure(err);
        }
        else {
            db.Performance.findAll({
                where: clause || {},
                include: [
                    {all: true}
                ]

            }).then(function (performances) {
                var items = performances.map(function (c) {
                    return c.toModel();
                });
                var retVal = _.groupBy(items,function(o) {
                    return o.statGroup;
                });
                response(res).page(retVal);

            }).catch(function (err) {
                response(res).failure(err);
            });
        }
    });
};
var whereClause = function(filters, currentUser, callback) {
    var clause = {};

    if(filters.fromdate){
        clause.date = {$gte: filters.fromdate}
    }

    if(filters.period){
        clause.period = filters.period;
    }

    if(filters.team && filters.team === 'true') {
        db.Team.findAll({
            where: {
                supervisorId :  currentUser.id
            }
        }).then(function (members) {
            var employeeIds = [];
            _.each(members, function(member) {
                employeeIds.push(member.json().memberId);
            });
            clause.EmployeeId = {$in: employeeIds};
            clause.currentState = filters.state;
            callback(null, clause);

        }).catch(function (err) {
            callback(err, clause);
        });
    }
    else {
        clause.EmployeeId = currentUser.id;
        callback(null, clause);
    }
};
