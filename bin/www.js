var CronJob = require('cron').CronJob;
//var db_test = require('../models_test');
var moment = require('moment');
moment.tz.setDefault("Asia/Kolkata");

var app = require('../app');

global.db = require('../models');
global.db_dwdb = require('../models_dwdb');

var debug = require('debug')('salesCoach-web:server');
var http = require('http');
var scheduler = require('../scheduler/schduleRunner');
var performance_update = require("../performance_update/update");
//performance_update.run(db,db_pr);




var port = (process.env.PORT || '3500');
 
app.set('port', port);


var server = http.createServer(app);

server.listen(port);

     

/*db.sequelize
    .sync().then(function() {

            console.log("Connection established");
    }).catch(function(error) {
        console.log(error);
    });*/

/*new CronJob('0 00 00 * * *', function () {
    scheduler.startExport();
}, null, true, 'Asia/Kolkata');
*/