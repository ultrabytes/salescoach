"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var sequelize = require('sequelize');
var moment = require('moment');
var log = require("../../api_logs/create_logs");
var logFile = "dsr_summary_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function(req, res){

	var filters = req.query;
	var currentUser = req.currentUser;
	// console.log("Current user employee id is --------->"+currentUser.EmployeeId);

    var startDate = filters.report_date;

    /*************** for days **********************/

    var eDate = getEndDateForDays(startDate);

    /******************** for days ***************************/




    /*********** for weeks ************************/

    var eDateForWeek = getEndDateForWeeks(startDate);
    var weekDates =  getAllWeeksDates(startDate,eDateForWeek);
    weekDates.push(startDate);

    //return res.send(weekDates);


    /************ end for weeks *********************/



    /**************for months ************************/


    var eDateForMonth = getEndDateForMonths(startDate);

    //return res.send(eDateForMonth);
    var monthBtwDates = getAllMonthsLastDate(startDate,eDateForMonth);
    monthBtwDates.push(startDate);
    // return res.send(monthBtwDates);


    /************* end for months *******************/



    /********** for years ********************/

        //// coming up


    var endDateYear = getFormattedDateString(moment(startDate,"YYYY-MM-DD").subtract(8,  'year'));

    var yearBtwDates = getAllYearsLastDate(startDate,endDateYear);
    yearBtwDates.push(startDate);

    //return res.send(yearBtwDates);


    //return res.send(endDateYear);


    /************** end for years ***********/

    /********** for quarter ********************/

    var endDateQuarter =  getFormattedDateString(moment(startDate,"YYYY-MM-DD").subtract(8,  'quarter'));

    var quarterBtwDates = getAllQuarterLastDate(startDate,endDateQuarter);

    quarterBtwDates.push(startDate);

    //return res.send(quarterBtwDates);

    /************** end for quarter ***********/

    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {

        if (err) {
            //log.run(req,response(res).customError(err),logFile);
            response(res).failure(err);
        }
        if(status == false)
        {
            //log.run(req,response(res).customError("Not Authorized !"),logFile);
            return  response(res).failure("Not Authorized !");
        }

        switch (filters.timeframe){

            case 'D':

                q.$and= [{Report_Dt: {$gte:eDate}},{Report_Dt:{$lte:startDate}}];
                break;

            case 'W':

                q.Report_Dt = {in:weekDates};

                break;

            case 'M':

                q.Report_Dt = {in:monthBtwDates};

                break;

            case 'Q':

                q.Report_Dt = {in:quarterBtwDates};

                break;

            case 'Y':

                q.Report_Dt = {in:yearBtwDates};

                break;





            default:

                q.$and= [{Report_Dt: {$gte:eDate}},{Report_Dt:{$lte:startDate}}];
                break;



        }
        q.timeframe = filters.timeframe;


        db_dwdb.SP_SLS_PRDCT_AGGR_FACT.findAll({
            where: q || null
        }).then(function(sr){

            var items = sr.map(function (c) {
                c.TimeFrame = moment(c.Report_Dt,"YYYY-MM-DD").format("DD-MMM-YY");
                return c.toModel();
            });

            return response(res).page(items);



        }).catch(function(err){
             return res.send(err);
        });




	});




};


var getEndDateForDays = function(st){

    var endDate = moment(st,"YYYY-MM-DD").subtract(8,  'days');

    var json = {"md": endDate};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);
    //
    //
    //


    if(process.env.NODE_ENV == 'production')
        var eDate = moment(dO.md,"YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var eDate = moment(dO.md,"YYYY-MM-DD").format("YYYY-MM-DD");

    return eDate;

};

var getEndDateForWeeks = function(st){

    var endDate = moment(st,"YYYY-MM-DD").subtract(8,  'weeks');

    var json = {"md": endDate};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);
    //
    //
    //


    if(process.env.NODE_ENV == 'production')
        var eDate = moment(dO.md,"YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var eDate = moment(dO.md,"YYYY-MM-DD").format("YYYY-MM-DD");

    return eDate;

};

var getEndDateForMonths = function(st){

    var endDate = moment(st,"YYYY-MM-DD").subtract(8,  'months');

    var json = {"md": endDate};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);
    //
    //
    //


    if(process.env.NODE_ENV == 'production')
        var eDate = moment(dO.md,"YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var eDate = moment(dO.md,"YYYY-MM-DD").format("YYYY-MM-DD");

    return eDate;

};


var getAllWeeksDates = function(st,ed){


    var start = moment(ed); // Sept. 1st
    var  end   = moment(st); // Nov. 2nd
    if(process.env.NODE_ENV == 'production')
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


var getAllMonthsLastDate = function(st,ed){


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('month').format('YYYY-MM-DD'));
        dateStart.add(1,'month');
    }


    return timeValues;



};


var getAllYearsLastDate = function(st,ed){


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('year').format('YYYY-MM-DD'));
        dateStart.add(1,'year');
    }


    return timeValues;



};

var getAllQuarterLastDate = function(st,ed){


    var dateStart = moment(ed);
    var dateEnd = moment(st);
    var timeValues = [];

    while (dateEnd > dateStart) {
        timeValues.push(dateStart.endOf('quarter').format('YYYY-MM-DD'));
        dateStart.add(1,'quarter');
    }


    return timeValues;



};


var getFormattedDateString = function(date){

    var json = {"md": date};
    //return res.send(json);
    var ds = JSON.stringify(json);

    var dO = JSON.parse(ds);

    if(process.env.NODE_ENV == 'production')
        var fd = moment(dO.md,"YYYY-MM-DD").utcOffset(0).format("YYYY-MM-DD");
    else
        var fd = moment(dO.md,"YYYY-MM-DD").format("YYYY-MM-DD");

    return fd;




};





var whereClause = function (req,res,filters, currentUser, callback) {
    var clause = [{  }];
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
        where : { employee_id : currentUser.EmployeeId }


    }).then(function(al)
    {

        //// console.log("Access Level is ------------------------------------------>");
        // // console.log(al);

        if(al){
            if(al.description == "Above Manager"){
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }

        if(al && al.access_level == 2)
        {
            // condition 1


            //// console.log("Emp Array is--->"+empArray);

            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    empArray.push(e.employee_id);
                });


                if(filters.report_date && filters.emp_id)
                {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    //// console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if(empArray.indexOf(empId) != -1)
                    {

                        q = { employee_id : filters.emp_id };
                        callback(null, clause,q,limit,offset,al,true);


                    }else
                    {
                        callback(null, clause,q,limit,offset,al,false);

                    }

                }else
                {

                    q = { employee_id : currentUser.EmployeeId  };


                    callback(null, clause,q,limit,offset,al,true);
                }



            });


        }else if(al && al.access_level == 1)
        {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if(filters.report_date && filters.emp_id)
            {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if(currentUser.EmployeeId == filters.emp_id)
                {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = { employee_id : filters.emp_id   };
                    callback(null, clause,q,limit,offset,al,true);

                }else
                {
                    // condition 3.2

                    // console.log("condition 3.2 is called ----------->");
                    callback(null, clause,q,limit,offset,al,false);
                }


            }else
            {
                // condition 4
                // console.log("condition 4 is called ----------->");
                q = { employee_id : currentUser.EmployeeId };
                if(filters.timestamp)
                {
                    q = { employee_id : currentUser.EmployeeId  };
                }

                callback(null, clause,q,limit,offset,al,true);

            }

            //  q = { employee_id : currentUser.EmployeeId , active:true };

            // if(filters.timestamp)
            // {
            //   q = { employee_id : currentUser.EmployeeId , active:true , last_updated : { $gt : filters.timestamp } };

            // }



        }else
        {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause,q,limit,offset,al,false);
        }





    });
};