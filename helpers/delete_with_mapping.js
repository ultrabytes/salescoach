var db = require('../models');
var response = require('./response');

exports.deleteLead = function(req,res,ids,currentTime,column,cb){

    var w = {};
    w[column] = {in: ids};


    db.lead.update({
        last_updated: currentTime,
        active:false

    },{

        where: w

    }).then(function (object) {

                    db.meeting.update({

                        lead_id: null,
                        last_updated:currentTime

                    },{

                        where : w
                    }).then(function(lu)
                    {
                        db.task.update({
                            lead_id: null,
                            last_updated: currentTime

                        },{
                            where : w
                        }).then(function(tu)
                        {
                            db.note.update({

                                lead_id: null,
                                last_updated: currentTime


                            },{

                                where : w
                            }).then(function(nu)
                            {

                                db.lead_stage_calculation.update({
                                    active: 0,
                                    last_updated: currentTime

                                },{

                                    where : w

                                }).then(function(){


                                    db.product_lead_mapping.update({
                                        active: 1,
                                        last_updated: currentTime
                                    },{
                                        where: w
                                    }).then(function(){

                                        db.lead_doc_mapping.update({
                                            active:0,
                                            last_updated:currentTime
                                        },{
                                            where: w
                                        }).then(function(){

                                            db.lead_status_calculation.update({
                                                active:0,
                                                last_updated:currentTime

                                            },{
                                                where: w
                                            }).then(function(){

                                            }).catch(function(err){
                                                cb(true);
                                            });

                                          //  cb(true);



                                        }).catch(function(err){
                                            response(res).failure(err);
                                        });



                                    }).catch(function(err){
                                        response(res).failure(err);
                                    });

                                }).catch(function(err){
                                    response(res).failure(err);
                                });


                            }).catch(function(err){
                                response(res).failure(err);

                            });

                        }).catch(function(err){
                            response(res).failure(err);

                        });

                    }).catch(function(err){
                        response(res).failure(err);

                    });
                })
                .catch(function (err) {

                    response(res).failure(err);
                });


}