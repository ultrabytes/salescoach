"use strict";
module.exports = function(sequelize , DataTypes){
    var lead_doc_mapping = sequelize.define('lead_doc_mapping', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lead_id: DataTypes.INTEGER,
        type: DataTypes.STRING,
        s3_key: DataTypes.STRING,
        thumbnail: {
            type:DataTypes.BLOB,
            get:function(){

                try{

                    var bufferBase64 = new Buffer( this.getDataValue('thumbnail').toString(), 'binary' ).toString('base64');
                    return bufferBase64;

                }catch(ex){
                    return this.getDataValue('thumbnail');

                }




            }

        },
        storage_type: DataTypes.STRING,
        account_id:DataTypes.INTEGER,
        employee_id:DataTypes.INTEGER,
        initial_create:DataTypes.BIGINT,
        last_updated:DataTypes.BIGINT,
        created_on:DataTypes.BIGINT,
        s3_id:DataTypes.INTEGER,
        active:DataTypes.INTEGER,
        doc_desc:DataTypes.STRING


    },{
        instanceMethods: {
            toModel: function () {
                var entity = this;

                var obj = {
                    Id: entity.id,
                    LeadId: entity.lead_id,
                    Type: entity.type,
                    S3Key: entity.s3_key,
                    S3Id: entity.s3_id,
                    Thumbnail: entity.thumbnail,
                    StorageType: entity.storage_type,
                    CreatedOn: entity.created_on,
                    DocDesc:entity.doc_desc,
                    AccountId: entity.account_id,
                    EmployeeId: entity.employee_id,
                    Active: entity.active,
                    InitialCreate:entity.initial_create,
                    LastUpdated:entity.last_updated,

                };

                return obj;
            }
        },freezeTableName: true,
    });
    return lead_doc_mapping;
};
