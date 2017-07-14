"use strict";
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var lead_indicator_msg_segmented = sequelize.define('lead_indicator_msg_segmented', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        setting_id : DataTypes.INTEGER,
        segmented_item_id: DataTypes.STRING,
        selected: DataTypes.INTEGER,
        lower_target: DataTypes.STRING,
        upper_target:DataTypes.STRING,
        lower_target_msg_ids: DataTypes.STRING,
        upper_target_msg_ids:DataTypes.STRING,
        status:DataTypes.INTEGER,
        initial_create:DataTypes.BIGINT,
        last_updated:DataTypes.BIGINT


    }, {
        instanceMethods: {
            toModel: function () {
                var lead_indicator_msg_segmented = {

                    Id: this.id,
                    SettingId: this.setting_id,
                    SegmentedItemId: this.segmented_item_id,
                    Selected: this.selected,
                    LowerTarget: this.lower_target,
                    UpperTarget:this.upper_target,
                    LowerTargetMsgIds: this.lower_target_msg_ids,
                    UpperTargetMsgIds: this.upper_target_msg_ids,
                    Status: this.status,
                    InitialCreate:this.initial_create,
                    LastUpdated:this.last_updated,



                };
                return lead_indicator_msg_segmented;
            }
        }, freezeTableName: true,
    });




    return lead_indicator_msg_segmented;
};