"use strict";
module.exports = function (sequelize, DataTypes) {
    var Contact = sequelize.define('contact', {
        contact_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        number: DataTypes.STRING,
        email: DataTypes.STRING,
        address: DataTypes.STRING,
        isLink: DataTypes.BOOLEAN,
        organization_id: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        account_id : DataTypes.INTEGER,
        isReassigned: DataTypes.BOOLEAN,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    }, {
        instanceMethods: {
            toModel: function (obOrganization,isReassigned) {
                if(!isReassigned)
                {
                    var isReassigned = 0;
                }
                var entity = this;
                var organization_id = null;
                if(obOrganization)
                {
                  organization_id = obOrganization.OrganizationId || obOrganization.organization_id;
                }else
                {
                	organization_id = entity.organization_id;
                }
                var obj = {
                    ContactId: entity.contact_id,
                    Name: entity.name,
                    Number: entity.number,
                    Email: entity.email,
                    Address: entity.address,
                    IsLink: entity.isLink,
                    OrganizationId: organization_id || null,
                    Organization: obOrganization || {},
                    EmployeeId: entity.employee_id,
                   // AccountId: entity.account_id,
                     //Employee : empObject || {},
                    //ResportingPerson : reportingPerson || {},
                    IsReassigned: isReassigned,
                    IsActive: entity.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };

                
                return obj;
            },
            toModelUpdate:function(){

                var entity = this;

                var obj = {
                    ContactId: entity.contact_id,
                    Name: entity.name,
                    Number: entity.number,
                    Email: entity.email,
                    Address: entity.address,
                    IsLink: entity.isLink,
                    OrganizationId: entity.organization_id || null,
                   // Organization: obOrganization || {},
                    EmployeeId: entity.employee_id,
                   // AccountId: entity.account_id,
                     //Employee : empObject || {},
                    //ResportingPerson : reportingPerson || {},
                    //IsReassigned: entity.isReassigned,
                    IsActive: entity.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };

                
                return obj;


            }
        },freezeTableName: true,
    });
    return Contact;
};
