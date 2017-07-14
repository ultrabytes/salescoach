'use strict';
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var lodash = require('lodash');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'local';
var config = require('../settings/config.json')[env];


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
  var db = {};

      fs
      .readdirSync(__dirname)
      .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename);
      })
      .forEach(function(file) {
        if (file.slice(-3) !== '.js') return;
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
      });

      db.lead.belongsTo(db.contact,{foreignKey: 'contact_id'});
      db.lead.belongsTo(db.leadsource,{foreignKey: 'lead_source_id'});

      db.lead.belongsTo(db.organization,{foreignKey: 'organization_id' });
      db.lead.hasMany(db.note,{foreignKey: 'lead_id'});

      db.metric_category.hasMany(db.metrics_definition,{foreignKey: 'metric_category_id'});
      db.metric_category.hasMany(db.target_individual_response,{foreignKey: 'metric_category_id'});
      db.target_individual_response.belongsTo(db.metric_category,{foreignKey: 'metric_category_id'});

      db.metrics_definition.belongsTo(db.template,{foreignKey: 'template_id'});
      db.contact.belongsTo(db.organization,{foreignKey: 'organization_id', through: db.organization });
      db.contact.belongsTo(db.employee,{foreignKey: 'employee_id' });


      db.task.belongsTo(db.contact,{foreignKey : 'contact_id'});
      db.task.belongsTo(db.lead,{foreignKey : 'lead_id'});
      db.lead_log.belongsTo(db.lead,{foreignKey : 'lead_id'});
     

      db.meeting.belongsTo(db.agent,{foreignKey : 'agent_id'});
      db.meeting.belongsTo(db.contact,{foreignKey : 'contact_id'});
      db.meeting.hasMany(db.note,{foreignKey: 'meeting_id'});
      db.note.belongsTo(db.meeting,{foreignKey : 'meeting_id'});
      db.note.belongsTo(db.agent,{foreignKey : 'agent_id'});
      db.note.belongsTo(db.lead,{foreignKey : 'lead_id'});

      db.meeting.belongsTo(db.lead,{foreignKey : 'lead_id'});
      db.lead.hasMany(db.meeting,{foreignKey : 'lead_id'});
      db.contact.hasMany(db.meeting,{as: 'meetings',foreignKey:'contact_id'});
      db.contact.hasMany(db.lead,{as: 'leads', foreignKey: 'contact_id'});
      db.contact.hasMany(db.note,{ as: 'notes', foreignKey: 'contact_id' });
      db.lead.hasMany(db.lead_stage_calculation,{foreignKey: 'lead_id'});
      db.lead.hasMany(db.lead_status_calculation,{foreignKey: 'lead_id'});
      db.lead_stage_calculation.belongsTo(db.lead_stage_settings,{foreignKey: 'stage_setting_id'});
     
      db.agent_stage_calculation.belongsTo(db.agent_stage_settings,{foreignKey: 'stage_setting_id'});
      db.agent_stage_settings.hasMany(db.agent_stage_calculation,{foreignKey: 'stage_setting_id'});
      db.agent_stage_settings.hasMany(db.milestone,{foreignKey: 'agent_stage_id'});
      db.agent_stage_settings.belongsTo(db.agent_radio_response,{ foreignKey: 'account_id',targetKey: 'account_id' });
      db.agent.belongsTo(db.agent_stage_settings,{foreignKey: 'agent_stage_id'});
      db.agent.hasMany(db.agent_stage_calculation,{foreignKey: 'agent_id'});
      db.agent.hasMany(db.agent_stage_calculation_temp,{foreignKey: 'agent_id'});

      
      db.meetingtype.belongsTo(db.account,{foreignKey : 'account_id'});
      

      db.employee.hasMany(db.meeting,{foreignKey: 'employee_id'});
      //db.product.hasMany(db.lead,{foreignKey: 'product_id' });
      db.lead.belongsTo(db.product,{foreignKey: 'product_id' })
      db.lead.hasMany(db.product_lead_mapping,{foreignKey: 'lead_id'});
      db.lead.hasMany(db.lead_doc_mapping,{foreignKey: 'lead_id'});
      db.meeting.belongsTo(db.employee,{foreignKey: 'employee_id'});
      db.employee.hasOne(db.access_level,{foreignKey: 'employee_id'});
      db.employee.belongsTo(db.role,{foreignKey: 'role_id'});

      db.screen_module.belongsTo(db.screen_module_master,{foreignKey: 'screen_module_master_id'});
      db.screen_module.hasMany(db.screen_field,{foreignKey: 'screen_module_id'});
      db.screen_field.belongsTo(db.screen_field_master,{foreignKey: 'screen_field_master_id'});
      db.screen_picklist.belongsTo(db.screen_picklist_master,{foreignKey: 'screen_picklist_master_id'});

      //db.Contact.hasMany(db.Meeting);
      //db.Meeting.belongsTo(db.Contact);

      //db.Contact.hasMany(db.Lead);
      //db.Lead.belongsTo(db.Contact);

      //db.Organization.hasMany(db.Contact);
      //db.Contact.belongsTo(db.Organization);

      //db.Product.hasMany(db.Amc);
      //db.Amc.belongsTo(db.Product);

      //db.Amc.hasMany(db.Lead);
      //db.Lead.belongsTo(db.Amc);

      //db.employee.hasMany(db.Contact);
      //db.Contact.belongsTo(db.employee);

      //db.employee.hasMany(db.employee);

      //db.Contact.hasMany(db.Task);
      //db.Task.belongsTo(db.Contact);

     // db.MeetingType.hasMany(db.Meeting);
     // db.Meeting.belongsTo(db.MeetingType);

      //db.Contact.hasMany(db.Note);
      //db.Note.belongsTo(db.Contact);

      

      //db.employee.hasMany(db.State);
      //db.State.belongsTo(db.employee);

      //db.employee.hasMany(db.Note);
      //db.Note.belongsTo(db.employee);

      //db.Meeting.hasMany(db.Note);
      //db.Note.belongsTo(db.Meeting);

      //db.Agent.hasMany(db.Note);
     // db.Note.belongsTo(db.Agent);

      //db.employee.hasMany(db.Contact);
      //db.Contact.belongsTo(db.employee);

      //db.employee.hasMany(db.Organization);
      //db.Organization.belongsTo(db.employee);

      //db.Lead.hasMany(db.Note);
      //db.Note.belongsTo(db.Lead);

      //db.Meeting.hasMany(db.State);
      //db.State.belongsTo(db.Meeting);

      //db.Lead.hasMany(db.Task);
      //db.Task.belongsTo(db.Lead);

      //db.employee.hasMany(db.Task);
      //db.Task.belongsTo(db.employee);

      //db.Lead.hasMany(db.State);
      //db.State.belongsTo(db.Lead);

      //db.LeadSource.hasMany(db.Lead);
      //db.Lead.belongsTo(db.LeadSource);

      //db.employee.hasMany(db.Lead);
      //db.Lead.belongsTo(db.employee);

     // db.Product.hasMany(db.Lead);
     // db.Lead.belongsTo(db.Product);

     // db.Organization.hasMany(db.Lead);
      //db.Lead.belongsTo(db.Organization);

      //db.Lead.hasMany(db.Meeting);
      //db.Meeting.belongsTo(db.Lead);

      //db.role.hasMany(db.employee);
      //db.employee.belongsTo(db.role);
      //db.employee.belongsTo(db.role, {
      //    foreignKey: {
      //        name: 'role_id',
      //        allowNull: false
      //    }
      //});

     // db.Statistic.hasMany(db.Performance);
     // db.Performance.belongsTo(db.Statistic);

      //db.employee.hasMany(db.Performance);
      //db.Performance.belongsTo(db.employee);

     // db.Product.hasMany(db.Performance);
     // db.Performance.belongsTo(db.Product);
      //db.Agent.hasMany(db.StageRecruitment);
      //db.StageRecruitment.belongsTo(db.Agent);

      //db.employee.hasMany(db.Agent);
      //db.Agent.belongsTo(db.employee);

      //db.employee.hasMany(db.StageRecruitment);
      //db.StageRecruitment.belongsTo(db.employee);

     // db.Agent.hasMany(db.AgentOrganizationMap);
      //db.AgentOrganization.hasMany(db.AgentOrganizationMap);
      //db.AgentOrganizationMap.belongsTo(db.Agent);
      //db.AgentOrganizationMap.belongsTo(db.AgentOrganization);

      //db.employee.hasMany(db.Team, {
      //    foreignKey: {
      //        name: 'supervisorId',
      //        allowNull: false
      //    }
      //});

      //db.employee.hasMany(db.Team, {
      //    foreignKey: {
      //        name: 'memberId',
      //        allowNull: false
      //   }
      //});

      Object.keys(db).forEach(function(modelName) {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
  });
  return db;
};

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, initModels());
