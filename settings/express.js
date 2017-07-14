var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');

var rootPath = '/usr/local/19thmileapp';//path.normalize(__dirname + '../../../');

module.exports.configureApp = function(app) {

   app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "*");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", false);

    // Pass to next layer of middleware
    next();
});

    
    app.set('port', process.env.PORT || 3500);
    
    app.use(logger('combined'));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    config.root = rootPath;
    app.set('views', path.join(rootPath,'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(rootPath,'public')));
    app.set('superSecret',"jaspreet");

   
};
