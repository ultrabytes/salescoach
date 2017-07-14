"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.organizationAssign = function(req,res){

    var currentTime = new Date().getTime();
    var filters = req.query;
    var currentUser = req.currentUser;
    var organizationIds = req.body.OrganizationIds || null;
    var EmployeeId = req.body.EmployeeId || null;
    db.organization.findAll({

        where: { organization_id : { in  : organizationIds } }
    }).then(function(orgs)
    {
        if(orgs.length > 0)
        {
            var tempOrgObject;
            var oganizationsObject = [];
            for(var i in orgs)
            {
                var org = orgs[i];
                tempOrgObject ={

                    account_id : org.account_id,
                    employee_id : EmployeeId,
                    name : org.name,
                    short_name : org.short_name,
                    phone_number : org.phone_number,
                    type : org.type,
                    initial_create : currentTime,
                    last_updated: currentTime,
                    ownership : org.Ownership,
                    industry :org.Industry,
                    revenue :org.Revenue,
                    account_type : org.AccountType,
                   employee_num :org.EmployeeNum,
                    add_picklist_1 : org.AddPicklist1,
                    add_picklist_2 : org.AddPicklist2,
                   add_picklist_3 :org.AddPicklist3,
                    add_num_field_1 : org.AddNum1,
                    add_num_field_2 : org.AddNum2,
                    add_text_field_1 : org.AddText1,
                    add_text_field_2 : org.AddText2,
                    add_date_field_1 : org.AddDate1,
                    add_date_field_2 : org.AddDate2


                };

                oganizationsObject.push(tempOrgObject);

            }


            db.organization.bulkCreate(oganizationsObject).then(function(oc)
            {
                db.organization.findAll({

                    where: { employee_id: EmployeeId , last_updated:currentTime }
                }).then(function(organizations)
                {
                    var items = organizations.map(function (c) {
                             return c.toModel();
                    });

                     response(res).page(items);

                }).catch(function(err)
                {
                     response(res).failure(err);
                });

            }).catch(function(err)
            {
                 response(res).failure(err);
            });
        }else
        {

                  res.json({
                        success: false,
                        ErrorCode: 116,
                        message: 'Unable to find organizations of these ids',
                        ServerCurrentTime: new Date().getTime(),
                        
                        });

        }

    }).catch(function(err)
    {
        response(res).failure(err);
    });

};

// exports.organizationAssign = function(req,res){
    
//     var currentTime = new Date().getTime();
//     var filters = req.query;
//     var currentUser = req.currentUser;
//     var organizationIds = req.body.OrganizationIds || null;
//     var EmployeeId = req.body.EmployeeId || null;

//     db.organization.findAll({
      
//       where : { organization_id : { in:  organizationIds }}

//     }).then(function(organizations)
//     {
//     	if(organizations.length > 0)
//     	{
//     		db.organization.update({
             
//                 employee_id : req.body.EmployeeId || null,
//                 isReassigned: 1,
//                 last_updated: currentTime

//     		},
//     		{
//     			where : { organization_id : { in : organizationIds }  }

//     		}
//     		).then(function(ou)
//     		{

//     			 var organizationLogObject = [];
//                  var tempOrganizationLog;
//                  for(var i in  organizations)
// 	             {
// 	                   var og = organizations[i];
// 	                   tempOrganizationLog = {

// 	                      organization_id : og.organization_id,
// 	                      old_employee_id : og.employee_id,
// 	                      new_employee_id : EmployeeId,
// 	                      assigned_by_id : currentUser.EmployeeId,
// 	                      initial_create : currentTime,
// 	                      last_updated : currentTime
// 	                   };

// 	                   organizationLogObject.push(tempOrganizationLog);


// 	               }



// 	               db.organization_log.bulkCreate(organizationLogObject).then(function(organizationLog)
//                    {

// 	                   db.organization_log.findAll(
// 	                    {
// 	                      where : { initial_create : currentTime }

// 	                    }).then(function(ols)
// 	                    {

// 	                        var items = ols.map(function (c) {
// 	                            return c.toModel();
// 	                         });

// 	                        response(res).page(items);

// 	                    });

//                  });


//     		});

//     	}else
//     	{
//     		         res.json({
//                         success: false,
//                         ErrorCode: 116,
//                         message: 'Unable to find organizations of these ids',
//                         ServerCurrentTime: new Date().getTime(),
                        
//                         });


//     	}


//     }).catch(function(err)
//     {
//        response(res).failure(err);
//     });
 

// };

