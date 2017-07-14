"use strict";
module.exports = function(sequelize , DataTypes){
    var MeetingType = sequelize.define('meetingtype',{
        meeting_type_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id : DataTypes.INTEGER,
        type: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            toModel: function(){
                return {
                    MeetingTypeId: this.meeting_type_id,
                   // AccountId : this.account_id,
                    Type: this.type,
                    IsActive: this.active,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,
                }
            }
        },freezeTableName: true,
    });
    return MeetingType;
};
