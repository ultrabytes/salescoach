"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function (req, res) {
    var currentUser = req.currentUser;
    var filters = req.query;
    var tempRoleResponseFields = {};

    // // console.log("Current user is --->");
    // // console.log(currentUser);


    whereClause(req, res, filters, currentUser, function (err, clause, q, limit, offset, al, status) {


        if (err) {
            //log.run(req,response(res).customError(err),logFile);
            response(res).failure(err);
        }
        if (status == false) {
            //log.run(req,response(res).customError("Not Authorized !"),logFile);
            return response(res).failure("Not Authorized !");
        }

        var emp_id = currentUser.EmployeeId;

        if (filters.emp_id) {
            emp_id = filters.emp_id;
        }

        getEmployee(emp_id, function (user) {

            //// console.log("Records for User ------------------------->"+user.employee_id);


            var queryObject = [];
            var FinalObject = [];
            db.metric_role_response.findAll({

                //include: [{model: db.metric_category , where: {active: true },required: false, include:[{model:db.metrics_definition, where:{active: true }, required: false,include:[{model: db.template, where: {active: true} , required: false  }] }]}],
                where: {
                    role_id: user.role_id,
                    account_id: user.account_id,
                    active: true,
                    status: 1,
                    last_updated: {$gt: filters.timestamp || 0}
                },
                attributes: ['metric_category_id'],
                group: ['metric_category_id']

            }).then(function (tiOs) {

                async.forEachSeries(tiOs, function (tiO, callback) {

                    db.metric_role_response.findAll({
                        where: {
                            role_id: user.role_id,
                            account_id: user.account_id,
                            active: true,
                            status: 1,
                            metric_category_id: tiO.metric_category_id,
                            last_updated: {$gt: filters.timestamp || 0}
                        },
                        // attributes: ['metric_id'],

                    }).then(function (mIds) {

                        //return res.send(mIds);

                        var tempMetricIdArray = [];


                        mIds.map(function (i) {
                            tempMetricIdArray.push(i.metric_id);
                            tempRoleResponseFields[i.metric_id] = {

                                "lead_indicator_frequency": i.lead_indicator_frequency,
                                "positive_message": i.positive_message,
                                "negative_message": i.negative_message,
                                "lead_indicator": i.lead_indicator

                            };
                        });


                        //// console.log("Account id ------------------>"+currentUser.AccountId);

                        db.metric_account_response.findAll({

                            where: {account_id: user.account_id, metric_id: {in: tempMetricIdArray}, active: 1},
                            attributes: ['metric_id']
                        }).then(function (MIDs) {

                            queryObject.push({metricCategory: tiO.metric_category_id, metricIds: MIDs});
                            callback();

                        });


                    });


                }, function (err) {
                    if (err) return next(err);

                    //response(res).page(queryObject);

                    //return res.send(tempRoleResponseFields);

                    async.forEachSeries(queryObject, function (qO, callback2) {

                        db.metric_category.findOne({

                            where: {
                                global_metric_category_id: qO.metricCategory,
                                active: true,
                                account_id: user.account_id
                            }
                        }).then(function (mc) {

                            if (mc) {

                                // return res.send(mc);

                                var MetricCategory = mc.toModel();
                                MetricCategory.MetricCategoryId = mc.global_metric_category_id;
                                var metIdsArray = [];
                                qO.metricIds.map(function (mid) {
                                    metIdsArray.push(mid.metric_id);

                                });

                                db.metrics_definition.findAll({

                                    where: {
                                        global_metric_id: {in: metIdsArray},
                                        active: 1,
                                        account_id: user.account_id
                                    },
                                    include: [{model: db.template, where: {active: true}, required: false}]
                                }).then(function (mids) {

                                    //return res.send(mids);

                                    if (mids) {

                                        MetricCategory.MetricDefinition = mids.map(function (md) {


                                            if (md) {
                                                var tempMd = md.toModel();
                                                tempMd.MetricId = md.global_metric_id;
                                                tempMd.MetricCategoryId = MetricCategory.MetricCategoryId;
                                                tempMd.LeadIndicatorFrequency = (tempRoleResponseFields[md.global_metric_id]) ? tempRoleResponseFields[md.global_metric_id].lead_indicator_frequency || null : null;
                                                tempMd.PositiveMessage = (tempRoleResponseFields[md.global_metric_id]) ? tempRoleResponseFields[md.global_metric_id].positive_message || null : null;
                                                tempMd.NegativeMessage = (tempRoleResponseFields[md.global_metric_id]) ? tempRoleResponseFields[md.global_metric_id].negative_message || null : null;
                                                tempMd.LeadIndicator = (tempRoleResponseFields[md.global_metric_id]) ? tempRoleResponseFields[md.global_metric_id].lead_indicator : 0;
                                                if (md.template) {

                                                    tempMd.Template = md.template.toModel();
                                                } else {
                                                    tempMd.Template = null;
                                                }

                                                return tempMd;
                                            } else {
                                                return null;
                                            }


                                        });

                                        FinalObject.push(MetricCategory);
                                        callback2();
                                    } else {
                                        MetricCategory.MetricDefinition = null;
                                        FinalObject.push(MetricCategory);
                                        callback2();

                                    }

                                });
                            } else {
                                callback2();
                            }


                        }).catch(function (err) {
                            response(res).failure(err);
                        });

                    }, function (err) {

                        if (err) return next(err);
                        response(res).page(FinalObject);

                    });

                });


            }).catch(function (err) {

                response(res).failure(err);
            });


        });


    });


};


var whereClause = function (req, res, filters, currentUser, callback) {
    var clause = [{}];
    var empArray = [];
    var emp = null;
    var q = null;
    var limit = 5;
    var offset = 0;
    var aboveManager = 0;
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }

    db.access_level.findOne({
        where: {employee_id: currentUser.EmployeeId}


    }).then(function (al) {

        //// console.log("Access Level is ------------------------------------------>");
        // // console.log(al);

        if (al) {
            if (al.description == "Above Manager") {
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }

        if (al && al.access_level == 2) {
            // condition 1


            //// console.log("Emp Array is--->"+empArray);

            reportingPerson.all(req, res, currentUser.EmployeeId, function (empObject) {

                empObject.map(function (e) {

                    empArray.push(e.employee_id);
                });


                if (filters.emp_id) {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    //// console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if (empArray.indexOf(empId) != -1) {

                        q = {employee_id: filters.emp_id};
                        callback(null, clause, q, limit, offset, al, true);


                    } else {
                        callback(null, clause, q, limit, offset, al, false);

                    }

                } else {

                    q = {employee_id: currentUser.EmployeeId};


                    callback(null, clause, q, limit, offset, al, true);
                }


            });


        } else if (al && al.access_level == 1) {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if (filters.emp_id) {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if (currentUser.EmployeeId == filters.emp_id) {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = {employee_id: filters.emp_id};
                    callback(null, clause, q, limit, offset, al, true);

                } else {
                    // condition 3.2

                    // console.log("condition 3.2 is called ----------->");
                    callback(null, clause, q, limit, offset, al, false);
                }


            } else {
                // condition 4
                // console.log("condition 4 is called ----------->");
                q = {employee_id: currentUser.EmployeeId};
                if (filters.timestamp) {
                    q = {employee_id: currentUser.EmployeeId};
                }

                callback(null, clause, q, limit, offset, al, true);

            }


        } else {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause, q, limit, offset, al, false);
        }


    });
};


var getEmployee = function (eid, cb) {

    db.employee.find({
        where: {employee_id: eid}
    }).then(function (employeeObject) {

        cb(employeeObject);

    }).catch(function (err) {
        response(res).failure(err);
    });


}

