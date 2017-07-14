"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Currency = sequelize.define('currency', {
        currency_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        currency_code: DataTypes.STRING,
        currency_name: DataTypes.STRING,
        active: DataTypes.BOOLEAN
       
    },{
        instanceMethods: {
            toModel: function() {
                var obj ={
                    CurrencyId: this.currency_id,
                    CurrencyCode: this.currency_code,
                    CurrencyName: this.currency_name,
                };
                return obj;
            },
            json: function() {
                var obj ={
                    CurrencyId: this.currency_id,
                    CurrencyCode: this.currency_code,
                    CurrencyName: this.currency_name,
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Currency;
};

