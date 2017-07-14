'use strict';
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var lodash = require('lodash');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'local';
var config = require('../settings/config_test.json')[env];
var db_test = require('../models_test');

var sequelize_pr = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: '3306',
      logging: console.log,
      define: {
          timestamps: false
      }
    }
);

var initModels = function () {
  var db_test = {};

      fs
      .readdirSync(__dirname)
      .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename);
      })
      .forEach(function(file) {
        if (file.slice(-3) !== '.js') return;
        var model = sequelize_pr['import'](path.join(__dirname, file));
        db_test[model.name] = model;
      });



      Object.keys(db_test).forEach(function(modelName) {
      if (db_test[modelName].associate) {
        db_test[modelName].associate(db_test);
      }
  });
  return db_test;
};

module.exports = lodash.extend({
  sequelize: sequelize_pr,
  Sequelize: Sequelize
}, initModels());
