'use strict';
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var lodash = require('lodash');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'local';
var config = require('../settings/config_dwdb.json')[env];

var sequelize = new Sequelize(
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
  var db_dwdb = {};

      fs
      .readdirSync(__dirname)
      .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename);
      })
      .forEach(function(file) {
        if (file.slice(-3) !== '.js') return;
        var model = sequelize['import'](path.join(__dirname, file));
        db_dwdb[model.name] = model;
      });

      

      Object.keys(db_dwdb).forEach(function(modelName) {
      if (db_dwdb[modelName].associate) {
        db_dwdb[modelName].associate(db_dwdb);
      }
  });
  return db_dwdb;
};

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, initModels());
