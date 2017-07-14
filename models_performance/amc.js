"use strict";
module.exports = function(sequelize , DataTypes){
    var Amc = sequelize.define('amc', {
        amc_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        account_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN         
    },{
        instanceMethods: {             
            toModel: function () {
                var entity = this;
                var obj = {
                AmcId:entity.amc_id,
                Name: entity.name,
                ProductId: entity.product_id,
                InitialCreate: entity.initial_create,
                LastUpdated: entity.last_updated,
                };
 
                return obj;
            }
        },freezeTableName: true
    });
    return Amc;
};
