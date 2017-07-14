"use strict";
var moment = require('moment');

module.exports = function(sequelize , DataTypes){
    var Region = sequelize.define('subregion', {
        subregion_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        region_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        timezone: DataTypes.STRING,
       // initial_create: DataTypes.INTEGER,
        //last_updated: DataTypes.INTEGER,
       // active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function() {
                var obj ={
                    SubregionId: this.subregion_id,
                    RegionId: this.region_id,
                    Name: this.name,
                    Timezone: this.timezone,
                   // InitialCreate: this.initial_create,
                   // LastUpdated: this.last_update
                };
                return obj;
            },
        }//, freezeTableName: true,
    });
    return Region;
};

