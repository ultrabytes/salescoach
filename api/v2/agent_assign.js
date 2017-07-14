"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');

exports.agentAssign = function(req,res)
{
    var currentTime = new Date().getTime();
    var filters = req.query;
    var currentUser = req.currentUser;
    var AgentIds = req.body.AgentIds || null;
    var EmployeeId = req.body.EmployeeId || null;
    return db.sequelize.transaction(function(t){

        return db.agent.findAll(
            {
                where : { agent_id : { in: AgentIds }  }


            }).then(function(agents)
        {
            if(agents.length > 0)
            {
                return db.agent.update(
                    {

                        employee_id : req.body.EmployeeId || null,
                        //isReassigned: 1,
                        last_updated: currentTime

                    },
                    {
                        where : { agent_id : { in : AgentIds }  },
                        transaction:t

                    }
                ).then(function(ua)
                {
                    var agentLogObject = [];
                    var tempAgeLog;
                    //var orgIds = [];

                    for(var i in  agents)
                    {
                        var agent = agents[i];
                        // orgIds.push(con.organization_id);

                        tempAgeLog = {

                            agent_id : agent.agent_id,
                            old_employee_id : agent.employee_id,
                            new_employee_id : EmployeeId,
                            assigned_by_id : currentUser.EmployeeId,
                            initial_create : currentTime,
                            last_updated : currentTime
                        };

                        agentLogObject.push(tempAgeLog);


                    }

                    return db.meeting.update({

                            employee_id : EmployeeId,
                            last_updated: currentTime
                        },
                        {
                            where : { agent_id : { in: AgentIds } },
                            transaction: t
                        }
                    ).then(function(mu)
                    {

                        return db.note.update(
                            {
                                employee_id : EmployeeId,
                                last_updated: currentTime

                            },
                            {
                                where : { agent_id : { in: AgentIds } },
                                transaction: t

                            }
                        ).then(function(nu)
                        {
                            return db.agent_stage_calculation.update(
                                {
                                    employee_id : EmployeeId,
                                    last_updated: currentTime

                                },
                                {
                                    where : { agent_id : { in: AgentIds } },
                                    transaction: t

                                }

                            ).then(function(){

                                return db.agent_log.bulkCreate(agentLogObject,{transaction:t});
                            });



                        }); /// note update



                    });




                });

            }else
            {
                res.json({
                    success: false,
                    ErrorCode: 116,
                    message: 'Unable to find agents of these ids',
                    ServerCurrentTime: new Date().getTime(),

                });
            }
            //res.json({ Contacts : contacts.length });

        }).catch(function (err) {
                response(res).failure(err);
            }
        );


    }).then(function()
    {
        return db.agent_log.findAll(
            {
                where : { initial_create : currentTime }

            }).then(function(als)
        {
            // console.log("als is ------->"+als);

            var items = als.map(function (c) {
                return c.toModel();
            });

            response(res).page(items);

        });

    }).catch(function(err)
    {
        response(res).failure(err);
    });





};

