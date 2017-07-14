"use strict";
module.exports = function(sequelize , DataTypes){
    var LeadSource = sequelize.define('leadsource',{
        lead_source_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN,
        position: DataTypes.INTEGER
       
    },{
        instanceMethods: {
            toModel: function(){
                return {
                    LeadSourceId: this.lead_source_id,
                    Name: this.name,
                    Position: this.position || null,
                    IsActive: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                }
            },
        },freezeTableName : true,
    });
    return LeadSource;
};
