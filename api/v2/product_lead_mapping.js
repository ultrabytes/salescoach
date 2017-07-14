"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var reportingPerson = require('../../helpers/reporting_heirarchy');

exports.all = function (req, res) {

     var filters = req.query;
     var currentUser = req.currentUser;
     var currentTime = new Date().getTime();

    whereClause(req,res,filters, currentUser, function (err, clause,q,limit,offset,al,status) {

        if (err) {

            return response(res).failure(err);
        }
        if(status == false)
        {

            response(res).failure("Not Authorized !");
        }else{


            db.product_lead_mapping.findAndCountAll({

                where: q || null,
                limit: limit , offset: offset,
                order: [["last_updated","ASC"]]

            }).then(function(pdm){

                //return res.send({length: pdm.rows.length});

                var items = pdm.rows.map(function (c) {

                    return c.toModel();

                });

                var moreRecordsAvailable = false;

                if(pdm.count > pdm.rows.length)
                {
                    moreRecordsAvailable = true;
                }

                var resJson = {
                    success: true,
                    ErrorCode : 100,
                    message: 'completed sucessfully',
                    items: items,
                    recordCount: items.length,
                    ServerCurrentTime: currentTime,
                    moreRecordsAvailable: moreRecordsAvailable
                };


                res.json(resJson);

            }).catch(function(err){
                response(res).failure(err);
            });






        }





    });




};

exports.create = function(req,res){

	 var filters = req.query;
     var currentUser = req.currentUser;
     var data = req.body;
     var action = "create";
     var currentTime = new Date().getTime();

     db.product_lead_mapping.create(toEntity(data,req,res,action,currentTime)).then(function(i){

         if(data.LeadId){
             db.lead.update({last_updated: currentTime},{
                 where:{lead_id: data.LeadId}
             }).then(function(lu){

                 response(res).data(i.toModel());

             }).catch(function(err){
                 response(res).failure(err);
             });
         }else{
             response(res).data(i.toModel());
         }




     });


};

exports.update = function(req,res){

     var filters = req.query;
     if(filters.id){
     var currentUser = req.currentUser;
     var data = req.body;

     var action = "update";
     var currentTime = new Date().getTime();

     db.product_lead_mapping.update(toEntity(data,req,res,action,currentTime),{

         where: {id:filters.id }
     }).then(function(i){

          db.product_lead_mapping.findOne({
            where:{id: filters.id}
          }).then(function(pl){

                  db.lead.update({last_updated: currentTime},{
                      where: {lead_id: pl.lead_id}
                  }).then(function(lu){

                      response(res).data(pl.toModel());

                  });

          }).catch(function(err){

                response(res).failure(err);

          });


     }).catch(function(err){
           response(res).failure(err);
     });
   }else{

        var resJson = {
                        success: false,
                        ErrorCode: 116,
                        message: 'Parameter id missing from request.',
                        ServerCurrentTime: new Date().getTime(),
                        
                        };


        res.json(resJson);
   }


};


exports.delete = function (req, res) {

    var currentTime = new Date().getTime();
    var id = req.params.id;

     db.product_lead_mapping.update({active: 0,last_updated: currentTime},{
       where: {id: id}

     }).then(function(dl){

         db.product_lead_mapping.findOne({
             where: {id: id}
         }).then(function(pl){

             db.lead.update({last_updated: currentTime},{
                 where: {lead_id: pl.lead_id}
             }).then(function(lu){

                 response(res).success();

             }).catch(function(err){

                 response(res).failure();
             });
         }).catch(function(err){
             response(res).failure(err);
         });


     }).catch(function(err){
         response(res).failure(err);
     });

};







var toEntity = function(data,req,res,action,currentTime){



	var json = {

		lead_id : data.LeadId || null,
		product_code: data.ProductCode || null,
		unit: data.Unit || null,
		amount: data.Amount || null,
		product_name: data.ProductName,
		employee_id: data.EmployeeId || req.currentUser.EmployeeId,
		account_id: data.AccountId || req.currentUser.AccountId,
        close_date: data.CloseDate || null,
        stage: data.Stage || null,
        sub_product_id: data.SubProductId || null,
        sub_product_name: data.SubProductName || null,
        commission_rate: data.CommissionRate || null,
		last_updated: currentTime
	};
     if(action == "create"){

         json.initial_create = new Date().getTime();

     }


	return json;


};



var whereClause = function (req,res,filters, currentUser, callback) {
    var clause = [{  }];
    var empArray = [];
    var emp = null;
    var q = null;
    var limit = 5;
    var offset = 0;
    var aboveManager = 0;
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }

    db.access_level.findOne({
        where : { employee_id : currentUser.EmployeeId }


    }).then(function(al)
    {

        // console.log("Access Level is ------------------------------------------>");
        // console.log(al);

        if(al){
            if(al.description == "Above Manager"){
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }

        if(al && al.access_level == 2)
        {
            // condition 1


            // console.log("Emp Array is--->"+empArray);

            reportingPerson.all(req,res,currentUser.EmployeeId,function(empObject){

                empObject.map(function(e){

                    empArray.push(e.employee_id);
                });


                if(filters.timestamp && filters.emp_id)
                {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    // console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if(empArray.indexOf(empId) != -1)
                    {

                        q = { employee_id : filters.emp_id , last_updated : { $gt : filters.timestamp },active:true };
                        callback(null, clause,q,limit,offset,al,true);


                    }else
                    {
                        callback(null, clause,q,limit,offset,al,false);

                    }

                }else
                {

                    q = { employee_id : currentUser.EmployeeId , active: true };
                    if(filters.timestamp)
                    {
                        q = { employee_id : currentUser.EmployeeId,last_updated : { $gt : filters.timestamp }, active: true  };
                    }

                    callback(null, clause,q,limit,offset,al,true);
                }



            });


        }else if(al && al.access_level == 1)
        {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if(filters.timestamp && filters.emp_id)
            {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if(currentUser.EmployeeId == filters.emp_id)
                {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = { employee_id : filters.emp_id , last_updated : { $gt : filters.timestamp }, active: true  };
                    callback(null, clause,q,limit,offset,al,true);

                }else
                {
                    // condition 3.2

                    // console.log("condition 3.2 is called ----------->");
                    callback(null, clause,q,limit,offset,al,false);
                }


            }else
            {
                // condition 4
                // console.log("condition 4 is called ----------->");
                q = { employee_id : currentUser.EmployeeId, active: true  };
                if(filters.timestamp)
                {
                    q = { employee_id : currentUser.EmployeeId ,last_updated : { $gt : filters.timestamp } , active: true };
                }

                callback(null, clause,q,limit,offset,al,true);

            }

            //  q = { employee_id : currentUser.EmployeeId , active:true };

            // if(filters.timestamp)
            // {
            //   q = { employee_id : currentUser.EmployeeId , active:true , last_updated : { $gt : filters.timestamp } };

            // }



        }else
        {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause,q,limit,offset,al,false);
        }





    });
};