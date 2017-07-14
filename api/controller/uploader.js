var fs = require('fs');

var async = require('async');
var db = require('../../models');
var csv = require('fast-csv');

var withFileForm = require('../../lib/fileUpload').withFileForm;

var addProduct=  function(data, cb){
    var product = db.Product.build({
        name: data.name
    });
        product.save()
        .then(function(){
                cb(null)
            })
        .catch(cb);
};

var AddProductList= function (data, callback) {
    async.each(data , function(product, next){
        addProduct(product, function(err){
           if(err) return next(err);

            next();
        })
    }, function(err){
        callback(err);
    })
};


exports.bulkUpload = function(req, res){
    var parseData = [];
    withFileForm(req, function(err, fields, files) {
        if (err)
            return res.json({result: 'error'});

        if(files.length == 0)
            return res.json({result: 'can not contain data'});

        var stream = fs.createReadStream(files.record.path);
        csv.fromStream(stream, {headers : true, ignoreEmpty: true})
            .on("data", function(data){
                parseData.push(data);
            })
            .on("end", function(){
                AddProductList(parseData, function(err) {
                    if(err){
                        return res.json({
                            status: false,
                            message:'Error while working'
                        });
                    }
                    res.json({
                        status: true,
                        message:'Completely Uploaded',
                        data: []
                    });
                })
            });
    });
};