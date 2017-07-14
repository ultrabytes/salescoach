"use strict";
module.exports = function(sequelize , DataTypes){
    var Team = sequelize.define('team', {
        team_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        supervisor_id: DataTypes.INTEGER,
        member_id: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.INTEGER

    },{
        instanceMethods: {             
            toModel: function () {
                var entity = this;
                var obj = {
                    TeamId: entity.team_id,
                    SupervisorId: entity.supervisor_id,
                    MemberId: entity.member_id,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
 
                return obj;
            },
             toModelPost: function (localId) {
                var entity = this;
                var obj = {
                    TeamId: entity.team_id,
                    LocalId:localId || null,
                    SupervisorId: entity.supervisor_id,
                    MemberId: entity.member_id,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };
 
                return obj;
            }
        },freezeTableName: true,
    });
    return Team;
};
