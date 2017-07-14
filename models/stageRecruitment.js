"use strict";
module.exports = function(sequelize , DataTypes){
    var StageRecruitment = sequelize.define('StageRecruitment',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        date: DataTypes.DATE,
        isCurrent: DataTypes.BOOLEAN
    },{
        instanceMethods: {
            json: function() {
                return {
                    id: this.id,
                    Name: this.name,
                    Date: this.date,
                    IsCurrent: this.isCurrent
                }
            }
        }
    });
    return StageRecruitment;
};
