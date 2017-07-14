"use strict";
module.exports = function(sequelize , DataTypes){
    var State = sequelize.define('State',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        date: DataTypes.STRING,
        dateTime: DataTypes.DATE,
        IsCurrent: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            json: function () {
                var obj = {
                    id: this.id,
                    Name: this.name,
                    Date: this.date,
                    IsCurrent: this.IsCurrent
                };
                return obj;
            }
        },
        classMethods: {

        }
    });
    return State;
};

