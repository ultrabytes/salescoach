'use strict';
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var lodash = require('lodash');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'local';
var config = require('../settings/config_pr.json')[env];
var db = require('../models');

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
  var db_pr = {};

      fs
      .readdirSync(__dirname)
      .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename);
      })
      .forEach(function(file) {
        if (file.slice(-3) !== '.js') return;
        var model = sequelize_pr['import'](path.join(__dirname, file));
        db_pr[model.name] = model;
      });


       db_pr.lead.hasMany(db_pr.lead_stage_calculation,{foreignKey: 'lead_id'});
       db_pr.lead.belongsTo(db_pr.leadsource,{foreignKey: 'lead_source_id'});
       db_pr.lead_stage_calculation.belongsTo(db_pr.lead_stage_settings,{foreignKey: 'stage_setting_id'});

      
      

      Object.keys(db_pr).forEach(function(modelName) {
      if (db_pr[modelName].associate) {
        db_pr[modelName].associate(db_pr);
      }
  });
  return db_pr;
};

module.exports = lodash.extend({
  sequelize: sequelize_pr,
  Sequelize: Sequelize
}, initModels());
