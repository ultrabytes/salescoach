"use strict";
module.exports = function (sequelize, DataTypes) {
    var account_setting = sequelize.define('account_setting', {
        setting_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        allow_duplicate_contacts : DataTypes.BOOLEAN,
        status:DataTypes.INTEGER,
        account_id:DataTypes.INTEGER
        
    }, {
        instanceMethods: {
            toModel: function () {
                var accountSettings = {
                    SettingId: this.setting_id,
                    AllowDuplicateContacts: this.allow_duplicate_contacts,
                    Status: this.status,
                    AccountId: this.account_id
                };
                return accountSettings;
            }
        }, freezeTableName: true,
    });
    
    return account_setting;
};