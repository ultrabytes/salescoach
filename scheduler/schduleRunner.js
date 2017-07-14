var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var mailer = require('../middleware/mailer');
var runner = require('./runner');

//console.log(moment().month(2).startOf('month'));
//console.log("startDate-->"+moment().month(3).startOf('month').toDate());
//console.log("EndDate-->"+moment().month(2).add(12,'month').endOf('month').toDate());
var calculateQuarter = function(startyear, currentDate){
    var obj = [];
    for(var i= 0 ;i<4;i++){
        var datelimit ={};
        if(obj[i-1]){
            //console.log("quarter------------->"+(i+1)+"start at--->"+moment(JSON.parse(JSON.stringify(obj[i-1].end))).add(1,'month').startOf('month'));
            datelimit.start = moment(JSON.parse(JSON.stringify(obj[i-1].end))).add(1,'month').startOf('month');
        }else {
            datelimit.start = moment(JSON.parse(JSON.stringify(startyear))).add(1,'month').startOf('month');
            //console.log("quarter------------->"+(i+1)+"start at--->"+moment(JSON.parse(JSON.stringify(startyear))).add(1,'month').startOf('month'));
        }

        datelimit.end = moment(JSON.parse(JSON.stringify(startyear.add(3 ,'month').endOf('month'))));
        obj.push(datelimit);


    }

    //console.log("Main Object is--->"+JSON.stringify(obj));
    var exist = _.find(obj, function(item){
        return moment('2015-12-01').utc().quarter()
        moment().quarter();
    });
    //console.log("Exitsts Object-->"+JSON.stringify(exist));
    return exist;
};

var start = function() {
    var curr = new Date;
    var retVal = calculateQuarter(moment().month(2).startOf('month'), moment().toDate());
      //console.log("Return VAlue--->"+JSON.stringify(retVal));
    var configurations =  [
        {
            period:'Daily',
            startDate:  moment().startOf('day').toDate(),
            endDate: moment().add(1,'days').toDate()
        },
        {
            period:'Weekly',
            startDate: new Date(curr.setDate(curr.getDate() - curr.getDay())),
            endDate: new Date(curr.setDate(curr.getDate() - curr.getDay()+6))
        },
        {
            period:'Monthly',
            startDate: moment().startOf('month').toDate(),
            endDate: moment().endOf("month").toDate()
        },
        {
            period:'Quarterly',
            startDate: retVal.start.toDate(),
            endDate: retVal.end.toDate()
        },
        {
            period:'Yearly',
            startDate: moment().month(3).startOf('month').toDate(),
            endDate: moment().month(2).add(12,'month').endOf('month').toDate()
        }
    ];
    async.eachSeries(configurations, function(configuration, callback) {
        runner.executeRunner(configuration, function(err){
            if(err){
                //console.log("Error Thrown-------->");
                var customMail = new mailer('ankit.rana.1195@gmail.com', 'Error', 'error', {obj:err});
                customMail.send()
            }
            callback(err);
        })
    })
};
exports.StatePercentage = {
    "Prospects": 10,
    "Proposal Given": 20,
    "In Negotiation": 30,
    "Contacted": 40
};

start();


exports.startExport = start;