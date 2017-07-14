"use strict";
module.exports = function(sequelize , DataTypes){
    var forgot_password = sequelize.define('forgot_password', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: DataTypes.STRING,
        access_code: DataTypes.STRING,
        created_at: DataTypes.TIME
    },{
        instanceMethods: {
            toModel: function () {
                var entity = this;
                var obj = {
                    Email: entity.email,
                    AccessCode: entity.access_code,

                };

                return obj;
            },

        },freezeTableName: true,
    });
    return forgot_password;
};

