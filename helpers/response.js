'use strict';
module.exports = function (res) {
    return {
        success: function (message) {
            res.json({
                ErrorCode : 100,
                success: true,
                message: message ? message : 'completed sucessfully',
                ServerCurrentTime: new Date().getTime(),
            });
        },

        returnSuccess: function(message){

            return {
                ErrorCode : 100,
                success: true,
                message: message ? message : 'completed sucessfully',
                ServerCurrentTime: new Date().getTime(),


            };
        },
        failure: function (error, message) {
           
            res.json({
                success: false,
                ErrorCode:116,
                message: message ? message : 'fail',
                ServerCurrentTime: new Date().getTime(),
                error: error
            });
        },

        customError: function(error,message){
            return {
              
                success: false,
                ErrorCode:116,
                message: message ? message : 'fail',
                ServerCurrentTime: new Date().getTime(),
                error: error


            };

        },
        data: function (item, message) {
            res.json({
                success: true,
                ErrorCode : 100,
                message: message ? message : 'completed sucessfully',
                items: item?[item]:[],
                ServerCurrentTime: new Date().getTime(),
                recordCount:item?1:0
            });
        },
        createSuccess: function (item, message) {
            res.json({
                success: true,
                ErrorCode : 100,
                message: message ? message : 'created sucessfully',
                ServerCurrentTime: new Date().getTime(),
                initial_create: item.InitialCreate
            });
        },
        updateSuccess: function (item, message) {
            res.json({
                success: true,
                ErrorCode : 100,
                message: message ? message : 'updated sucessfully',
                last_updated: item.LastUpdated
            });
        },
        page: function (items, timestamp, message) {
            res.json({
                success: true,
                ErrorCode : 100,
                message: message ? message : 'completed sucessfully',
                //timestamp:timestamp,
               
                items: items,
                ServerCurrentTime: new Date().getTime(),
                recordCount: items.length
            });
        }
    };
};

