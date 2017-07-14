"use strict";
module.exports = function (sequelize, DataTypes) {
    var lead_indicator_msg_master = sequelize.define('lead_indicator_msg_master', {
        message_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        type : DataTypes.INTEGER,
        message:DataTypes.STRING,
        initial_create:DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        status: DataTypes.INTEGER,

    }, {
        instanceMethods: {
            toModel: function () {
                var lead_indicator_msg_master = {
                    MessageId: this.message_id,
                    Type: this.type,
                    Message: this.message,
                    Status: this.status,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,

                };
                return lead_indicator_msg_master;
            }
        }, freezeTableName: true,
    });

    return lead_indicator_msg_master;
};