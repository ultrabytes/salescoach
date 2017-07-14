"use strict";
module.exports = function (sequelize) {
    var AgentOrganizationMap = sequelize.define('AgentOrganizationMap', {});

    return AgentOrganizationMap;
};