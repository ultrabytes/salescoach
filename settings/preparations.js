var fs = require('fs');
var path = require('path');

var rootPath = '/usr/local/19thmileapp';//path.normalize(__dirname + './../');

var mkdir = function(path, callback) {
    callback = callback || function() {};

    fs.exists(path, function(exists) {
        if (!exists) {
            fs.mkdir(path, function(err) {
                if (err) {
                    console.log('Create dir ', err);
                }

                callback();
            });
        }
    });
};

var prepareTmpDir = function() {
    mkdir(rootPath + 'temp');
};
exports.init = function() {
    prepareTmpDir();
};
