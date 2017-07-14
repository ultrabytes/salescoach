"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var log = require("../../api_logs/create_logs");
var logFile = "dsr_summary_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');
exports.all = function (req, res) {

    var filters = req.query;
    var empArray = [];


    var startDate = filters.report_date;

    /*************** for days **********************/

    var eDate = getEndDateForDays(startDate);

    /******************** for days ***************************/

        //return res.send({startDate:startDate,Endate:eDate});

    var alldatesForD = getDatesBetweenTwo(startDate, eDate);
    alldatesForD.push(startDate);
    alldatesForD = alldatesForD.reverse();


    /*********** for weeks ************************/

    var eDateForWeek = getEndDateForWeeks(startDate);
    var weekDates = getAllWeeksDates(startDate, eDateForWeek);
    weekDates.push(startDate);

    weekDates = weekDates.reverse();


    /************ end for weeks *********************/


    /**************for months ************************/


    var eDateForMonth = getEndDateForMonths(startDate);

    //return res.send(eDateForMonth);
    var monthBtwDates = getAllMonthsLastDate(startDate, eDateForMonth);
    monthBtwDates.push(startDate);
    monthBtwDates = monthBtwDates.reverse();


    /************* end for months *******************/


    /********** for years ********************/

        //// coming up


    var endDateYear = getFormattedDateString(moment(startDate, "YYYY-MM-DD").subtract(8, 'year'));

    var yearBtwDates = getAllYearsLastDate(startDate, endDateYear);
    yearBtwDates.push(startDate);
    yearBtwDates = yearBtwDates.reverse();

    //return res.send(yearBtwDates);


    //return res.send(endDateYear);


    /************** end for years ***********/

    /********** for quarter ********************/

    var endDateQuarter = getFormattedDateString(moment(startDate, "YYYY-MM-DD").subtract(8, 'quarter'));

    var quarterBtwDates = getAllQuarterLastDate(startDate, endDateQuarter);

    quarterBtwDates.push(startDate);
    quarterBtwDates = quarterBtwDates.reverse();


    switch (filters.timeframe) {

        case 'D':

            getRecords(req, res, filters, alldatesForD);
            break;

        case 'W':

            getRecords(req, res, filters, weekDates);

            break;

        case 'M':

            getRecords(req, res, filters, monthBtwDates);

            break;

        case 'Q':

            getRecords(req, res, filters, quarterBtwDates);

            break;

        case 'Y':

            getRecords(req, res, filters, yearBtwDates);

            break;


        default:

            getRecords(req, res, filters, alldatesForD);
            break;


    }


};


var getRecords = function (req, res, filters, alldatesForD) {

    var empArray = [];
    var salesByProductO = [];
    var targetConsolidated = [];


    reportingPerson.all(req, res, filters.emp_id, function (empObject) {


        empObject.map(function (e) {
            empArray.push(e);
        });

        getEmployee(filters.emp_id, function (empO) {

            empArray.push(empO);

            async.forEachSeries(empArray, function (eO, callback) {

                getMetricsForEmployee(eO, filters, function (employeeMetrics) {

                    async.forEachSeries(alldatesForD, function (d, cb2) {

                        db_dwdb.SP_SLS_PRDCT_AGGR_FACT.findAll({
                            where: {
                                employee_id: eO.employee_id,
                                metric_id: {in: employeeMetrics},
                                Report_Dt: d,
                                timeframe: filters.timeframe
                            }
                        }).then(function (pc) {

                            if (pc.length > 0) {

                                pc.map(function (c) {
                                    var o = c.toModel();
                                    o.EmployeeName = eO.first_name + " " + eO.last_name;

                                    salesByProductO.push(o);
                                });


                                return cb2({flag: true});

                            } else {
                                cb2();
                            }

                        });


                    }, function (err) {


                        async.forEachSeries(alldatesForD, function (d2, cb3) {
                            db_dwdb.SP_AGGR_FACT.findAll({
                                where: {
                                    employee_id: eO.employee_id,
                                    metric_id: {in: employeeMetrics},
                                    Report_Dt: d2,
                                    timeframe: filters.timeframe
                                }
                            }).then(function (tc) {


                                if (tc.length > 0) {

                                    tc.map(function (c) {

                                        var o = c.toModel();
                                        o.EmployeeName = eO.first_name + " " + eO.last_name;
                                        targetConsolidated.push(o);
                                    });

                                    return cb3({flag: true});


                                } else {
                                    cb3();
                                }


                            });


                        }, function (err) {
                            callback();
                        });


                    });


                }); // getEmployeeMetrics


            }, function (err) {

                var resJson = {
                    success: true,
                    ErrorCode: 100,
                    message: 'completed sucessfully',
                    ReportDate: filters.report_date,
                    MetricCategoryId: filters.metric_category_id,
                    Timeframe: filters.timeframe,
                    "non-segmented": targetConsolidated,
                    segmented: salesByProductO,
                    ServerCurrentTime: new Date().getTime(),

                };

                return res.send(resJson);


            }); // emparray Ends Async Loop

        }); // get employee ends


    }); // reporting person ends

}; //get records ends

var getMetrics = function (req, res, id, cb) {
    db.metrics_definition.findAll({
        where: {metric_category_id: id}
    }).then(function (o) {

        var mArray = [];

        o.map(function (i) {
            mArray.push(i.metric_id);

        });

        cb(mArray);

    });

}


var getMetricsForEmployee = function (empO, filters, cb) {


    db.metric_role_response.findAll({
        where: {
            role_id: empO.role_id,
            account_id: empO.account_id,
            active: 1,
            status: 1,
            metric_category_id: filters.metric_category_id
        }
    }).then(function (o) {

        var mArray = [];

        o.map(function (i) {
            mArray.push(i.metric_id);

        });

        cb(mArray);

    });

};


var getEndDateForDays = function (st) {

    var endDate = moment(st, "YYYY-MM-DD").subtract(8, 'days');

    var json = {"md": endDate};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);

    if (process.env.NODE_ENV == 'production')
        var eDate = moment(dO.md, "YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var eDate = moment(dO.md, "YYYY-MM-DD").format("YYYY-MM-DD");

    return eDate;

};

var getEndDateForWeeks = function (st) {

    var endDate = moment(st, "YYYY-MM-DD").subtract(8, 'weeks');

    var json = {"md": endDate};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);

    if (process.env.NODE_ENV == 'production')
        var eDate = moment(dO.md, "YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var eDate = moment(dO.md, "YYYY-MM-DD").format("YYYY-MM-DD");

    return eDate;

};

var getEndDateForMonths = function (st) {

    var endDate = moment(st, "YYYY-MM-DD").subtract(8, 'months');

    var json = {"md": endDate};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);
    //
    //
    //


    if (process.env.NODE_ENV == 'production')
        var eDate = moment(dO.md, "YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var eDate = moment(dO.md, "YYYY-MM-DD").format("YYYY-MM-DD");

    return eDate;

};


var getAllWeeksDates = function (st, ed) {


    var start = moment(ed); // Sept. 1st
    var end = moment(st); // Nov. 2nd

    if (process.env.NODE_ENV == 'production')
        var day = 6;
    else
        var day = 0;

    var result = [];
    var current = start.clone();

    while (current.day(7 + day).isBefore(end)) {

        var d = getFormattedDateString(current.clone());
        result.push(d);
    }

    return result;


};


var getAllMonthsLastDate = function (st, ed) {


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('month').format('YYYY-MM-DD'));
        dateStart.add(1, 'month');
    }


    return timeValues;


};


var getAllYearsLastDate = function (st, ed) {


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('year').format('YYYY-MM-DD'));
        dateStart.add(1, 'year');
    }


    return timeValues;


};

var getAllQuarterLastDate = function (st, ed) {


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('quarter').format('YYYY-MM-DD'));
        dateStart.add(1, 'quarter');
    }


    return timeValues;


};


var getFormattedDateString = function (date) {

    var json = {"md": date};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);

    if (process.env.NODE_ENV == 'production')
        var fd = moment(dO.md, "YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var fd = moment(dO.md, "YYYY-MM-DD").format("YYYY-MM-DD");

    return fd;


};

var getDatesBetweenTwo = function (st, ed) {


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('day').format('YYYY-MM-DD'));
        dateStart.add(1, 'day');
    }


    return timeValues;


};

var getEmployee = function (id, cb) {

    db.employee.findOne({
        where: {employee_id: id}
    }).then(function (o) {
        cb(o);
    });

};


