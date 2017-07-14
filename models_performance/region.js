"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Region = sequelize.define('region', {
        region_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        iso: DataTypes.STRING,
        iso3: DataTypes.STRING,
        fips: DataTypes.STRING,
        country: DataTypes.STRING,
        currency_id:DataTypes.INTEGER,
        continent: DataTypes.STRING,
        currency_code: DataTypes.STRING,
        currency_name: DataTypes.STRING,
        phone_prefix: DataTypes.STRING,
        postal_code: DataTypes.STRING,
        languages: DataTypes.STRING,
        geonameid: DataTypes.INTEGER,
        // initial_create: DataTypes.INTEGER,
        // last_updated: DataTypes.INTEGER,
        // active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj ={
                    RegionId: this.region_id,
                    Iso: this.iso,
                    Iso3: this.iso3,
                    Fips: this.fips,
                    Country: this.country,
                    CurrencyId: this.currency_id,
                    Continent: this.continent,
                    CurrencyCode: this.currency_code,
                    CyrrencyName: this.currency_name,
                    PhonePrefix: this.phone_prefix,
                    PostalCode: this.postal_code,
                    Languages: this.languages,
                    Geonameid: this.geonameid,
                   /* InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated*/
                };
                return obj;
            },
        }, freezeTableName: true,
    });
    return Region;
};

