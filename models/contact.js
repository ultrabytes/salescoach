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
        seen: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
        age_group:DataTypes.STRING,
        income: DataTypes.STRING,
        dependent: DataTypes.STRING,
        add_picklist_1: DataTypes.STRING,
        add_picklist_2: DataTypes.STRING,
        add_picklist_3: DataTypes.STRING,
        add_num_field_1: DataTypes.DOUBLE,
        add_num_field_2: DataTypes.DOUBLE,
        add_text_field_1: DataTypes.STRING,
        add_text_field_2: DataTypes.STRING,
        add_date_field_1: DataTypes.BIGINT,
        add_date_field_2: DataTypes.BIGINT
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
                    Seen:entity.seen,
                   // AccountId: entity.account_id,
                     //Employee : empObject || {},
                    //ResportingPerson : reportingPerson || {},
                    AgeGroup: entity.age_group,
                    Income: entity.income,
                    Dependent: entity.dependent,
                    AddPicklist1: entity.add_picklist_1,
                    AddPicklist2: entity.add_picklist_2,
                    AddPicklist3: entity.add_picklist_3,
                    AddNum1: entity.add_num_field_1,
                    AddNum2: entity.add_num_field_2,
                    AddText1: entity.add_text_field_1,
                    AddText2: entity.add_text_field_2,
                    AddDate1: entity.add_date_field_1,
                    AddDate2: entity.add_date_field_2,
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
                    Seen:entity.seen,
                    AgeGroup: entity.age_group,
                    Income: entity.income,
                    Dependent: entity.dependent,
                    AddPicklist1: entity.add_picklist_1,
                    AddPicklist2: entity.add_picklist_2,
                    AddPicklist3: entity.add_picklist_3,
                    AddNum1: entity.add_num_field_1,
                    AddNum2: entity.add_num_field_2,
                    AddText1: entity.add_text_field_1,
                    AddText2: entity.add_text_field_2,
                    AddDate1: entity.add_date_field_1,
                    AddDate2: entity.add_date_field_2,
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
