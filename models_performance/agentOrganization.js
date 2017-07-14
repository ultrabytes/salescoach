"use strict";
module.exports = function (sequelize, DataTypes) {
    var AgentOrganization = sequelize.define('AgentOrganization', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING
    },{
        instanceMethods: {
            json: function () {
                var obj = {
                    id: this.id,
                    Name: this.name
                };
                return obj;
            }
        }
    });
    return AgentOrganization;
};