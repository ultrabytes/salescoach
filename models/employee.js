"use strict";
module.exports = function (sequelize, DataTypes) {
    var Employee = sequelize.define('employee', {
        employee_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        middle_name: DataTypes.STRING,
        password: DataTypes.STRING,
        employee_code: {
            type: DataTypes.STRING
        },
        role_id: DataTypes.INTEGER,
        account_id: DataTypes.INTEGER,
        phone_number: DataTypes.STRING,
        email: DataTypes.STRING,
        token: DataTypes.STRING,
        status: DataTypes.INTEGER,
        gender: DataTypes.INTEGER,
        default_picklist: DataTypes.INTEGER,
        business_unit: DataTypes.STRING,
        reporting_person: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,

        
    },
     {
        instanceMethods: {
            toModel: function () {
                var employee = {
                    EmployeeId: this.employee_id,
                    FirstName: this.first_name,
                    LastName: this.last_name,
                    MiddleName: this.middle_name,
                    EmployeeCode: this.employee_code,
                    Email: this.email,
                    Password: this.password,
                    AccountId: this.account_id,
                    PhoneNumber: this.phone_number,
                    RoleId:this.role_id,
                    BusinessUnit: this.business_unit,
                    ReportingPerson: this.reporting_person,
                    Status: this.status,
                    Token: this.token,
                    Gender:this.gender,
                    DefaultPicklist:this.default_picklist,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                };
                return employee;
            }
        }, freezeTableName: true,
    });
    
    return Employee;
};