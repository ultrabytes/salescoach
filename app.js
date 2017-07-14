var express = require('express');
var auth  = require('./middleware/authorization');
var app = express();


require('./settings/express').configureApp(app);
require('./settings/routes').configureRouting(app, auth);
require('./settings/preparations').init();


module.exports = app;
