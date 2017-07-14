"use strict";
module.exports = function(sequelize , DataTypes){
    var Role = sequelize.define('role',{
        role_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        position_level: DataTypes.STRING,
        role: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN

    },{
        instanceMethods: {
            toModel: function() {
                return {
                    RoleId: this.role_id,
                    PositionLevel: this.position_level,
                    //AccountId: this.account_id,
                    Role: this.role,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_update
                };
            }
        }, freezeTableName: true,
    });
    return Role;
};
