"use strict";
module.exports = function (sequelize, DataTypes) {
    var account = sequelize.define('account', {
        account_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        organization_id: DataTypes.INTEGER,
        industry_id: DataTypes.INTEGER,
        organization_name: DataTypes.STRING,
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        region_id: DataTypes.INTEGER,
        subregion_id: DataTypes.INTEGER,
        phone_number:DataTypes.STRING,
        email_id: DataTypes.STRING,
        password: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        financial_year_start: DataTypes.INTEGER,
        currency_id: DataTypes.INTEGER,
        start_of_week: DataTypes.INTEGER,
        number_of_working_days: DataTypes.INTEGER,
        default_picklist: DataTypes.INTEGER,
        allowDuplicateContact: DataTypes.BOOLEAN,
        active: DataTypes.BOOLEAN
    }, {
        instanceMethods: {
            toModel: function () {
                var account = {
                    AccountId: this.account_id,
                    OrganizationId: this.organization_id,
                    FirstName: this.first_name,
                    LastName: this.last_name,
                    RegionId:this.region_id,
                    SubregionId: this.subregion_id,
                    PhoneNumber: this.phone_number,
                    EmailId: this.email_id,
                    Password:this.password,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,
                    FinancialYearStart: this.financial_year_start,
                    CurrencyId:this.currency_id,
                    StartOfWeek: this.start_of_week,
                    NumberOfWorkingDays: this.number_of_working_days,
                    DefaultPicklist: this.default_picklist,
                    IsActive: this.active
                };
                return account;
            }
        }, freezeTableName: true,
    });
    
    return account;
};