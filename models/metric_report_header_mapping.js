"use strict";
module.exports = function (sequelize, DataTypes) {
    var metric_report_header_mapping = sequelize.define('metric_report_header_mapping', {
        MetricReport_SheetId: DataTypes.INTEGER,
        MetricReport_SheetLabel: DataTypes.STRING,
        MetricId: DataTypes.INTEGER,
        Access_Level: DataTypes.INTEGER,
        MetricReport_HeaderId:{
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        Metric_Report_HeaderLabel: DataTypes.STRING,
        Metric_Report_API_Key: DataTypes.STRING,
        Position_Level:DataTypes.INTEGER,
        Status: DataTypes.INTEGER,
        Initial_Create: DataTypes.BIGINT,
        Last_Updated: DataTypes.BIGINT
    }, {
        instanceMethods: {
            toModel: function () {
                var metric_report_header_mapping = {
                    MetricReportSheetId: this.MetricReport_SheetId,
                    MetricReportSheetLabel: this.MetricReport_SheetLabel,
                    MetricId: this.MetricId,
                    AccessLevel:this.Access_Level,
                    MetricReportHeaderId: this.MetricReport_HeaderId,
                    MetricReportHeaderLabel: this.Metric_Report_HeaderLabel,
                    MetricReportAPIKey: this.Metric_Report_API_Key,
                    PositionLevel: this.Position_Level,
                    Status: this.Status
                };
                return metric_report_header_mapping;
            }
        }, freezeTableName: true,
    });

    return metric_report_header_mapping;
};