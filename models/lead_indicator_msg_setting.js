"use strict";
module.exports = function (sequelize, DataTypes) {
    var lead_indicator_msg_setting = sequelize.define('lead_indicator_msg_setting', {
        setting_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        account_id: DataTypes.INTEGER,
        role_id: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        selection_base: DataTypes.STRING,
        metric_id: DataTypes.INTEGER,
        metric_category_id: DataTypes.INTEGER,
        positive_message_ids: DataTypes.STRING,
        negative_message_ids: DataTypes.STRING,
        status: DataTypes.INTEGER,
        segmented: DataTypes.INTEGER,
        segmentation_type: DataTypes.STRING,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT

    }, {
        instanceMethods: {
            toModel: function () {
                var lead_indicator_msg_setting = {
                    SettingId: this.setting_id,
                    AccountId: this.account_id,
                    RoleId: this.role_id,
                    EmployeeId: this.employee_id,
                    SelectionBase: this.selection_base,
                    MetricId: this.metric_id,
                    MetricCategoryId: this.metric_category_id,
                    PositiveMessageIds: this.positive_message_ids,
                    NegativeMessageIds: this.negative_message_ids,
                    Status: this.status,
                    Segmented:this.segmented,
                    SegmentationType:this.segmentation_type,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated

                };
                return lead_indicator_msg_setting;
            }
        }, freezeTableName: true,
    });

    return lead_indicator_msg_setting;
};