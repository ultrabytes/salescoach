var path = require('path');
var fs = require('fs');

var formidable = require('formidable');

var rootPath = path.normalize(__dirname + './../');

exports.withFileForm = function(req, callback) {
    var form = new formidable.IncomingForm();
    form.uploadDir = rootPath +'temp' ;
    form.keepExtensions = true;

    form.parse(req, callback);
};