"use strict";
var _ = require('underscore');

module.exports = function(sequelize , DataTypes){
    var Organization = sequelize.define('organization',{
        organization_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        short_name: DataTypes.STRING,
        type: DataTypes.INTEGER,
        phone_number: DataTypes.INTEGER,
        address: DataTypes.STRING,
        isReassigned: DataTypes.BOOLEAN,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    }, {
        instanceMethods: {
            toModel: function () {
                var obj = {
                    OrganizationId: this.organization_id,
                    Name: this.name,
                    //AccountId: this.account_id,
                    ShortName: this.short_name,
                    Type: this.type,
                    PhoneNumber: this.phone_number,
                    Address: this.address || null,
                    EmployeeId : this.employee_id || null,
                    //IsReassigned: this.isReassigned,
                    IsActive: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return obj;
            }
        }
    , freezeTableName: true,
    });
    return Organization;
};
