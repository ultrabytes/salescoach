"use strict";
module.exports = function (sequelize, DataTypes) {
    var metrics_definition = sequelize.define('metrics_definition', {
        metric_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        metric_name: DataTypes.STRING,
        metric_category_id: DataTypes.INTEGER,
        default:DataTypes.INTEGER,
        description: DataTypes.STRING,
        explanation: DataTypes.STRING,
        unit: DataTypes.STRING,
        target: DataTypes.STRING,
        app_metric_table: DataTypes.STRING,
        web_metric_table: DataTypes.STRING,
        time_period_applicable: DataTypes.INTEGER,
        report_needed: DataTypes.INTEGER,
        report_template_app: DataTypes.STRING,
        report_template_web: DataTypes.STRING,
        perf_db_loc: DataTypes.STRING,
        metric_cal_formula: DataTypes.STRING,
        account_id: DataTypes.INTEGER,
        template_id: DataTypes.BIGINT,
        segmentation_status: DataTypes.INTEGER,
        segmentation_type: DataTypes.STRING,
        is_lead_indicator: DataTypes.INTEGER,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        position_in_row: DataTypes.STRING,
        positive_message: DataTypes.STRING,
        negative_message: DataTypes.STRING,
        graph_type: DataTypes.STRING,
        global_metric_id:DataTypes.INTEGER
    }, {
        instanceMethods: {
            toModel: function () {
                var metrics_definition = {
                    MetricId: this.metric_id,
                    MetricCategoryId: this.metric_category_id,
                    Name:this.metric_name,
                    Default: this.default,
                    Description: this.description,
                    Explanation: this.explanation,
                    Unit: this.unit,
                    Target: this.target,
                    AppMetricTable: this.app_metric_table,
                    WebMetricTable: this.web_metric_table,
                    TimePeriodApplicable: this.time_period_applicable,
                    ReportNeeded: this.report_needed,
                    InitialCreate: this.initial_create,
                    LastUpdated: this.last_updated,
                    IsSegmentedType: this.segmentation_status,
                    SegmentationType: this.segmentation_type,
                    TemplateId: this.template_id,
                    //IsLeadIndicator: this.is_lead_indicator,
                    PositionInRow: this.position_in_row,
                    GraphType: this.graph_type
                    // PositiveMessage: this.positive_message,
                    // NegativeMessage: this.negative_message
                };
                return metrics_definition;
            }
        }, freezeTableName: true,
    });
    
    return metrics_definition;
};