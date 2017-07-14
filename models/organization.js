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
        ownership:DataTypes.STRING,
        industry:DataTypes.STRING,
        revenue:DataTypes.STRING,
        account_type:DataTypes.STRING,
        employee_num:DataTypes.STRING,
        add_picklist_1:DataTypes.STRING,
        add_picklist_2:DataTypes.STRING,
        add_picklist_3:DataTypes.STRING,
        add_num_field_1:DataTypes.DOUBLE,
        add_num_field_2:DataTypes.DOUBLE,
        add_text_field_1:DataTypes.STRING,
        add_text_field_2:DataTypes.STRING,
        add_date_field_1:DataTypes.BIGINT,
        add_date_field_2:DataTypes.BIGINT,
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
                    Ownership : this.ownership || null,
                    Industry : this.industry || null,
                    Revenue : this.revenue || null,
                    AccountType : this.account_type || null,
                    EmployeeNumber : this.employee_num || null,
                    AddPicklist1 : this.add_picklist_1 || null,
                    AddPicklist2 : this.add_picklist_2 || null,
                    AddPicklist3 : this.add_picklist_3 || null,
                    AddNum1 : this.add_num_field_1 || null,
                    AddNum2 : this.add_num_field_2 || null,
                    AddText1 : this.add_text_field_1 || null,
                    AddText2 : this.add_text_field_2 || null,
                    AddDate1 : this.add_date_field_1 || null,
                    AddDate2 : this.add_date_field_2 || null,
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
