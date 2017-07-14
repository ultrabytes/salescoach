"use strict";
module.exports = function (sequelize, DataTypes) {
    var target_individual_response = sequelize.define('target_individual_response', {
        target_individual_response_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        employee_id: DataTypes.INTEGER,
        metric_category_id: DataTypes.INTEGER,
        metric_id:DataTypes.INTEGER,
        target_period: DataTypes.STRING,
        segmentation_id: DataTypes.INTEGER,
        segmentation_type: DataTypes.STRING,
        q1: DataTypes.BIGINT,
        q2: DataTypes.BIGINT,
        q3: DataTypes.BIGINT,
        q4: DataTypes.BIGINT,
        month1: DataTypes.BIGINT,
        month2: DataTypes.BIGINT,
        month3: DataTypes.BIGINT,
        month4: DataTypes.BIGINT,
        month5: DataTypes.BIGINT,
        month6: DataTypes.BIGINT,
        month7: DataTypes.BIGINT,
        month8: DataTypes.BIGINT,
        month9: DataTypes.BIGINT,
        month10: DataTypes.BIGINT,
        month11: DataTypes.BIGINT,
        month12: DataTypes.BIGINT,
        daily_target: DataTypes.BIGINT,
        weekly_target: DataTypes.BIGINT,
        yearly_target: DataTypes.BIGINT,
        point_in_time: DataTypes.BIGINT,
        distribute_target: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT

    }, {
        instanceMethods: {
            toModel: function () {
                var target_individual_response = {
                    TargetIndividualResponseId: this.target_individual_response_id,
                    AccountId: this.account_id,
                    EmployeeId:this.employee_id,
                    MetricCategoryId: this.metric_category_id,
                    MetricId: this.metric_id,
                    TargetPeriod: this.target_period,
                    SegmentationId: this.segmentation_id,
                    SegmentationType: this.segmentation_type,
                    Q1: this.q1,
                    Q2: this.q2,
                    Q3: this.q3,
                    Q4: this.q4,
                    Month1: this.month1,
                    Month2: this.month2,
                    Month3: this.month3,
                    Month4: this.month4,
                    Month5: this.month5,
                    Month6: this.month6,
                    Month7: this.month7,
                    Month8: this.month8,
                    Month9: this.month9,
                    Month10: this.month10,
                    Month11: this.month11,
                    Month12: this.month12,
                    DailyTarget: this.daily_target,
                    WeeklyTarget: this.weekly_target,
                    YearlyTarget: this.yearly_target,
                    PointInTime: this.point_in_time,
                    DistributeTarget: this.distribute_target,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated
                  
                };
                return target_individual_response;
            }
        }, freezeTableName: true,
    });
    
    return target_individual_response;
};