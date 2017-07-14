"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var currentTime = new Date().getTime();
var log = require("../../api_logs/create_logs");
var logFile = "lead_log.txt";
var reportingPerson = require('../../helpers/reporting_heirarchy');
var dWM = require('../../helpers/delete_with_mapping');


exports.all = function (req, res) {

    var filters = req.query;
    var currentUser = req.currentUser;
    var currentTime = new Date().getTime();


    whereClause(req, res, filters, currentUser, function (err, clause, q, limit, offset, al, status) {
        if (err) {

            var error = {
                "success": false,
                "ErrorCode": 116,
                "message": "fail",
                "ServerCurrentTime": new Date().getTime(),
                "error": err
            };
            log.run(req, error, logFile, currentTime);
            response(res).failure(err);
        }
        if (status == false) {

            log.run(req, response(res).customError("Not Authorized !"), logFile, currentTime);


            response(res).failure("Not Authorized !");
        }
        else {

            //start else


            db.lead.count({
                where: q || {},

            }).then(function (count) {


                db.lead.findAll({
                    where: q || {},
                    include: [{
                        model: db.organization,

                    },
                        {
                            model: db.contact,
                            where: {$and: [{contact_id: {$ne: null}}, {active: true}]},
                            include: [db.organization]
                        },
                        {model: db.lead_stage_calculation, where: {active: 1}, required: false},
                        {model: db.lead_status_calculation, where: {active: 1}, required: false},
                        {model: db.product_lead_mapping, where: {active: 1}, required: false},
                        {model: db.note, where: {active: true}, required: false},
                        {model: db.lead_doc_mapping, where: {active: 1}, required: false}
                    ],
                    limit: 5, offset: offset,
                    order: [["last_updated", "ASC"]]

                }).then(function (leads) {
                    //return res.send(leads);

                    var items = [];

                    var items = leads.map(function (item) {

                        var obContact;
                        var obOrganization;
                        var obLeadStageCalculation;
                        var obNotes;
                        var obLeadProdInfo;
                        var leadDocMapping = null;
                        var obLeadStatusCalculation = [];

                        try {

                            obContact = returnContactForGet(item.contact, req);

                        } catch (e) {
                            obContact = item.contact;
                        }

                        try {

                            obNotes = returnNotes(item.notes, req);
                        } catch (e) {

                            obNotes = item.notes;
                        }

                        try {
                            obOrganization = returnOrganization(item.organization, req);
                        } catch (e) {      //// console.log("error is -->"+e);
                            obOrganization = item.organization;
                        }

                        try {

                            obLeadStageCalculation = returnLeadStageCalcuation(item.lead_stage_calculations, req);
                        } catch (e) {

                            obLeadStageCalculation = item.lead_stage_calculations;
                        }

                        if (item.product_lead_mappings) {

                            obLeadProdInfo = item.product_lead_mappings.map(function (pl) {

                                return pl.toModel();
                            });

                        } else {
                            obLeadProdInfo = null;
                        }

                        if (item.lead_doc_mappings) {
                            leadDocMapping = item.lead_doc_mappings.map(function (i) {

                                return i.toModel();
                            });
                        }

                        if (item.lead_status_calculations) {

                            obLeadStatusCalculation = item.lead_status_calculations.map(function (i) {

                                return i.toModel();
                            });
                        }


                        //res.send(item.contact);
                        if (item.employee_id == filters.emp_id) {
                            var IsReassigned = 0;
                        } else {
                            var IsReassigned = 1;
                        }

                        return item.toModel(obContact, obOrganization, obLeadStageCalculation, obLeadStatusCalculation, obNotes, obLeadProdInfo, leadDocMapping, IsReassigned);

                        // db_dwdb.DEAL_RISK_FACT.findAll({
                        //     where:{lead_id:item.lead_id,employee_id:Emp.employee_id,Account_ID:Emp.account_id}
                        // }).then(function(o){
                        //
                        //
                        //
                        //
                        //
                        //
                        //     if(o.length > 0){
                        //
                        //         temp.DealRiskFlag = o[0].DEAL_RISK_FLG || null;
                        //         temp.DealRiskDetailDesc = o[0].DEAL_RISK_DTL_DESC || null;
                        //         temp.Recommendation = o[0].DEAL_RISK_RECOMMEND_DTL_DESC || null;
                        //
                        //     }else{
                        //         temp.DealRiskFlag =  null;
                        //         temp.DealRiskDetailDesc =  null;
                        //         temp.Recommendation =  null;
                        //     }


                        //
                        // }).catch(function(err){
                        //     response(res).failure(err);
                        // });


                    });

                    var moreRecordsAvailable = false;

                    if (count > leads.length) {
                        moreRecordsAvailable = true;
                    }


                    var resJson = {
                        success: true,
                        ErrorCode: 100,
                        message: 'completed sucessfully',
                        items: items,
                        recordCount: items.length,
                        ServerCurrentTime: currentTime,
                        moreRecordsAvailable: moreRecordsAvailable
                    };
                    log.run(req, resJson, "lead_log.txt", currentTime);

                    res.json(resJson);


                }).catch(function (err) {

                    var error = {
                        "success": false,
                        "ErrorCode": 116,
                        "message": "fail",
                        "ServerCurrentTime": currentTime,
                        "error": err
                    };

                    log.run(req, error, logFile, currentTime);
                    response(res).failure(err);
                });


            });


            // end else
        }
    });


};

exports.createOrUpdate = function (req, res) {
    var Model = req.body;
    var data = req.body;

    var localId = data.LocalId || null;
    var localIdRecords = {};
    var localIdRecordsForStatusCalculation = {};
    var localIdforProduct = {};

    var id = req.params.id;
    var action = "";
    var currentTime = new Date().getTime();
    if ((id && id != 0)) {
        action = "update";
        var stageCal = req.body.StageCalculationId || null;
        var statusCal = req.body.StatusCalculationId || null;
        getAuthorizedUsers(req, res, function (status) {

            if (status == true) {

                return db.sequelize.transaction().then(function (t) {

                    db.lead.findOne({
                        where: {lead_id: id}
                    }).then(function (ld) {

                        return db.lead.update(toUpdate(data, req, res), {
                            where: {lead_id: id},
                            transaction: t
                        }).then(function (lu) {


                            if (!data.LeadStageCalculation) {
                                data.LeadStageCalculation = [];
                            }

                            if (!data.LeadStatusCalculation) {
                                data.LeadStatusCalculation = [];
                            }

                            if (!data.LeadProdInfo) {
                                data.LeadProdInfo = [];
                            }

                            async.forEachSeries(data.LeadStageCalculation, function (lcObject, callback) {

                                db.lead_stage_calculation.count({
                                    where: {stage_calculation_id: lcObject.StageCalculationId || 0}
                                }).then(function (lsc) {

                                    if (lsc > 0) {

                                        // console.log("In Update");

                                        return db.lead_stage_calculation.update(toLcUpdate(lcObject, ld, currentTime, req, res, "update"), {
                                            where: {stage_calculation_id: lcObject.StageCalculationId},
                                            transaction: t
                                        }).then(function (uLSC) {

                                            localIdRecords[lcObject.StageCalculationId] = lcObject.LocalId || null;
                                            callback();

                                        }).catch(function (err) {
                                            t.rollback();
                                            response(res).failure(err);
                                        });

                                    } else {

                                        // console.log("In insertion");
                                        return db.lead_stage_calculation.create(toLcUpdate(lcObject, ld, currentTime, req, res, "create"), {transaction: t}).then(function (cLSC) {
                                            localIdRecords[cLSC.stage_calculation_id] = lcObject.LocalId || null;

                                            callback();
                                        }).catch(function (err) {
                                            t.rollback();
                                            response(res).failure(err);
                                        });


                                    }


                                }).catch(function (err) {
                                    t.rollback();
                                    response(res).failure(err);
                                });


                            }, function (err) {
                                if (err) return next(err);
                                //res.send(localIdRecords);

                                var idLSC = null;
                                var idLSTC = null;
                                //res.send(localIdRecords);

                                for (var i in localIdRecords) {

                                    if (localIdRecords[i] == stageCal) {

                                        // console.log("value at"+i+"  is "+localIdRecords[i]);
                                        // console.log("local id is ------->"+localId);
                                        idLSC = i;
                                    }
                                }


                                async.forEachSeries(data.LeadProdInfo, function (pObject, callback2) {

                                    db.product_lead_mapping.count({
                                        where: {id: pObject.Id}
                                    }).then(function (ct) {

                                        if (ct > 0) {

                                            // console.log("Pobject will be updated !");

                                            return db.product_lead_mapping.update(toPlmUpdate(pObject, ld, currentTime, req, res, "update"), {
                                                where: {id: pObject.Id},
                                                transaction: t
                                            }).then(function (pLc) {

                                                localIdforProduct[pObject.Id] = pObject.LocalId || null;

                                                callback2();

                                            }).catch(function (err) {
                                                t.rollback();
                                                response(res).failure(err);
                                            });

                                        } else {
                                            // console.log("Pobject will be Created !");

                                            return db.product_lead_mapping.create(toPlmUpdate(pObject, ld, currentTime, req, res, "create"), {transaction: t}).then(function (pLc) {
                                                localIdforProduct[pLc.id] = pObject.LocalId || null;
                                                callback2();
                                            }).catch(function (err) {
                                                t.rollback();
                                                response(res).failure(err);
                                            });
                                        }


                                    }).catch(function (err) {

                                        t.rollback();
                                        response(res).failure(err);

                                    });


                                }, function (err) {

                                    db.lead_stage_calculation.count({
                                        where: {stage_calculation_id: stageCal}
                                    }).then(function (lsCount) {

                                        if (lsCount > 0) {

                                            idLSC = stageCal;
                                        }

                                        async.forEachSeries(data.LeadStatusCalculation, function (lcObject, callback2) {

                                            db.lead_status_calculation.count({
                                                where: {status_calculation_id: lcObject.StatusCalculationId || 0}
                                            }).then(function (lsc) {

                                                //console.log("Count reached -----------");

                                                if (lsc > 0) {

                                                    // console.log("In Update");

                                                    return db.lead_status_calculation.update(toLStCUpdate(lcObject, ld, currentTime, req, res, "update"), {
                                                        where: {status_calculation_id: lcObject.StatusCalculationId},
                                                        transaction: t
                                                    }).then(function (uLSC) {

                                                        localIdRecordsForStatusCalculation[lcObject.StatusCalculationId] = lcObject.LocalId || null;
                                                        callback2();

                                                    }).catch(function (err) {
                                                        console.log("Roleback 10");
                                                        t.rollback();
                                                        response(res).failure(err);
                                                    });

                                                } else {

                                                    // console.log("In insertion");
                                                    return db.lead_status_calculation.create(toLStCUpdate(lcObject, ld, currentTime, req, res, "create"), {transaction: t}).then(function (cLSC) {
                                                        localIdRecordsForStatusCalculation[cLSC.status_calculation_id] = lcObject.LocalId || null;

                                                        callback2();
                                                    }).catch(function (err) {


                                                        console.log("Roleback 9");
                                                        t.rollback();
                                                        response(res).failure(err);
                                                    });


                                                }


                                            }).catch(function (err) {
                                                console.log("Roleback 8");
                                                t.rollback();
                                                response(res).failure(err);
                                            });


                                        }, function (err) {

                                            // return res.send(statusCal);
                                            // console.log("Count reached -----------");


                                            for (var i in localIdRecordsForStatusCalculation) {

                                                if (localIdRecordsForStatusCalculation[i] == statusCal) {

                                                    // console.log("value at"+i+"  is "+localIdRecordsForStatusCalculation[i]);
                                                    // console.log("local id is ------->"+statusCal);
                                                    idLSTC = i;
                                                }
                                            }

                                            return db.lead_status_calculation.count({

                                                where: {status_calculation_id: statusCal}

                                            }).then(function (sT) {


                                                if (sT > 0) {
                                                    idLSTC = statusCal;
                                                }


                                                return db.lead.update({
                                                    stage_calculation_id: idLSC,
                                                    status_calculation_id: idLSTC
                                                }, {
                                                    where: {lead_id: id},
                                                    transaction: t
                                                }).then(function () {


                                                    t.commit().then(function () {

                                                        db.lead.find({
                                                            where: {lead_id: id},
                                                            include: [{
                                                                model: db.lead_stage_calculation,
                                                                where: {last_updated: currentTime},
                                                                required: false
                                                            },
                                                                {
                                                                    model: db.lead_status_calculation,
                                                                    where: {last_updated: currentTime},
                                                                    required: false
                                                                },
                                                                {model: db.product_lead_mapping, required: false},
                                                                {model: db.contact}]
                                                        }).then(function (pl) {


                                                            var tmpJson = pl.toModelUpdate();
                                                            tmpJson.LocalId = localId;
                                                            if (pl.lead_stage_calculations) {
                                                                tmpJson.LeadStageCalculation = pl.lead_stage_calculations.map(function (lsc) {
                                                                    var lscObject = lsc.toModel();
                                                                    lscObject.LocalId = localIdRecords[lsc.stage_calculation_id] || null;

                                                                    return lscObject;
                                                                });
                                                            } else {

                                                                tmpJson.LeadStageCalculation = null;

                                                            }

                                                            if (pl.lead_status_calculations) {
                                                                tmpJson.LeadStatusCalculation = pl.lead_status_calculations.map(function (lsc) {
                                                                    var lscObject = lsc.toModel();
                                                                    lscObject.LocalId = localIdRecordsForStatusCalculation[lsc.status_calculation_id] || null;

                                                                    return lscObject;
                                                                });
                                                            } else {

                                                                tmpJson.LeadStatusCalculation = null;

                                                            }

                                                            if (pl.product_lead_mappings) {

                                                                tmpJson.LeadProdInfo = pl.product_lead_mappings.map(function (p) {
                                                                    var plmObject = p.toModel();
                                                                    plmObject.LocalId = localIdforProduct[p.id] || null;
                                                                    return plmObject;
                                                                });

                                                            } else {
                                                                tmpJson.LeadProdInfo = null;
                                                            }

                                                            if (pl.contact) {
                                                                tmpJson.Contact = pl.contact.toModel();
                                                            } else {
                                                                tmpJson.Contact = null;
                                                            }
                                                            response(res).data(tmpJson);
                                                        }).catch(function (err) {
                                                            console.log("Roleback 3");
                                                            t.rollback();
                                                            response(res).failure(err);

                                                        });


                                                    });


                                                }).catch(function (err) {
                                                    console.log("Roleback 2");
                                                    t.rollback();
                                                    response(res).failure(err);
                                                });

                                            }).catch(function (err) {

                                                console.log("Roleback 1");
                                                t.rollback();
                                                response(res).failure(err);
                                            });


                                        });


                                    }).catch(function (err) {

                                        console.log("Roleback 4");

                                        t.rollback();
                                        response(res).failure(err);

                                    });

                                });


                            });


                        }).catch(function (err) {

                            console.log("Roleback 5");

                            t.rollback();
                            response(res).failure(err);
                        });


                    }).catch(function (err) {
                        console.log("Roleback 6");
                        response(res).failure(err);
                    });


                }).catch(function (err) {
                    console.log("Roleback 7");
                    t.rollback();
                    response(res).failure(err);
                });


            } else {

                log.run(req, response(res).customError("Not Authorized !"), logFile, currentTime);
                response(res).failure("Not Authorized !");

            }


        });
    }
    else {
        log.request(req, logFile);
        action = "create";
        var reqInfo = {cont_id: null, org_id: null, currentTime: currentTime};
        var localId = req.body.LocalId || null;
        var stageCal = req.body.StageCalculationId || null;
        var statusCal = req.body.StatusCalculationId || null;
        var results = {};

        return db.sequelize.transaction().then(function (t) {

            return createOrganization(req, res, reqInfo, t, function (obOrg) {

                return createContact(req, res, reqInfo, t, function (obCot) {


                    return db.lead.create(toEntity({}, Model, req.currentUser, action, reqInfo.cont_id, reqInfo.org_id), {transaction: t}).then(function (entity) {

                        var nO = req.body.Notes || null;

                        return createNotes(nO, req, res, entity, reqInfo, t, function (nO) {

                            var lsc = req.body.LeadStageCalculation || null;

                            // return createLeadStageCalculations2(lsc,req,res,reqInfo,entity,t,function(LSC)
                            // {

                            if (!req.body.LeadStageCalculation) {

                                var lsO = [];
                            } else {
                                var lsO = req.body.LeadStageCalculation;
                            }

                            if (!req.body.LeadStatusCalculation) {
                                var lstO = [];
                            } else {

                                var lstO = req.body.LeadStatusCalculation;
                            }

                            if (!req.body.LeadProdInfo) {

                                var plmO = [];
                            } else {
                                var plmO = req.body.LeadProdInfo;
                            }

                            async.forEachSeries(lsO, function (o, cb) {

                                return db.lead_stage_calculation.create(toLcUpdate(o, entity, currentTime, req, res, "create"), {transaction: t}).then(function (cLSC) {

                                    localIdRecords[cLSC.stage_calculation_id] = o.LocalId || null;


                                    cb();
                                }).catch(function (err) {
                                    t.rollback();
                                    response(res).failure(err);
                                });


                            }, function (err) {
                                if (err)
                                    return next(err);

                                var idLSC = null;
                                var idLSTC = null;
                                //res.send(localIdRecords);

                                for (var i in localIdRecords) {

                                    if (localIdRecords[i] == stageCal) {

                                        // // console.log("value at"+i+"  is "+localIdRecords[i]);
                                        // // console.log("local id is ------->"+localId);
                                        idLSC = i;
                                    }
                                }

                                //// console.log("Reached here --------------.")


                                async.forEachSeries(plmO, function (p, cb2) {


                                    return db.product_lead_mapping.create(toPlmUpdate(p, entity, currentTime, req, res, "create"), {transaction: t}).then(function (oPLM) {

                                        // // console.log("Creating Product Lead Mapping...");
                                        localIdforProduct[oPLM.id] = p.LocalId || null;

                                        cb2();
                                    }).catch(function (err) {
                                        t.rollback();
                                        response(res).failure(err);
                                    });


                                    cb2();

                                }, function (err) {

                                    if (err)
                                        return next(err);

                                    db.lead_stage_calculation.count({
                                        where: {stage_calculation_id: stageCal}
                                    }).then(function (cS) {

                                        if (cS > 0) {

                                            idLSC = stageCal;

                                        }


                                        db.lead_status_calculation.count({
                                            where: {status_calculation_id: statusCal}

                                        }).then(function (sT) {

                                            if (sT > 0) {
                                                idLSTC = statusCal;
                                            }


                                            async.forEachSeries(lstO, function (o, cb2) {


                                                return db.lead_status_calculation.create(toLStCUpdate(o, entity, currentTime, req, res, "create"), {transaction: t}).then(function (cLSC) {

                                                    localIdRecordsForStatusCalculation[cLSC.status_calculation_id] = o.LocalId || null;
                                                    cb2();
                                                }).catch(function (err) {
                                                    t.rollback();
                                                    response(res).failure(err);
                                                });
                                            }, function (err) {


                                                for (var i in localIdRecordsForStatusCalculation) {

                                                    if (localIdRecordsForStatusCalculation[i] == statusCal) {

                                                        // // console.log("value at"+i+"  is "+localIdRecords[i]);
                                                        // // console.log("local id is ------->"+localId);
                                                        idLSTC = i;
                                                    }
                                                }


                                                return db.lead.update({
                                                    stage_calculation_id: idLSC,
                                                    status_calculation_id: idLSTC
                                                }, {
                                                    where: {lead_id: entity.lead_id},
                                                    transaction: t
                                                }).then(function () {

                                                    commitResponse(t, entity, currentTime, localIdRecords, localIdRecordsForStatusCalculation, localIdforProduct, req, res, localId, reqInfo, obOrg, obCot);


                                                }).catch(function (err) {
                                                    t.rollback();
                                                    response(res).failure(err);
                                                });


                                            });


                                        }).catch(function (err) {
                                            t.rollback();
                                            response(res).failure(err);
                                        });


                                    }).catch(function (err) {

                                        t.rollback();
                                        response(res).failure(err);

                                    });


                                });


                            }); // end async loop


                            //}); // create lead calculation

                        });

                    }).catch(function (err) {
                        t.rollback();
                        response(res).failure(err);
                    });
                });

            });

        }).catch(function (err) {


            t.rollback();
            response(res).failure(err);
        });


    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    db.lead.find({
        where: {
            lead_id: id
        },
        include: [
            {all: true},
        ]
    }).then(function (entity) {
        //res.send(entity);
        var obContact;
        var obOrganization;
        try {
            obContact = returnContact(entity.contact);

        } catch (e) {
            obContact = entity.contact
        }

        try {
            obOrganization = returnOrganization(entity.organization, req);
        } catch (e) {      // console.log("error is -->"+e);
            obOrganization = entity.organization;
        }

        log.run(req, entity.toModel(obContact, obOrganization), "lead_log.txt");
        response(res).data(entity.toModel(obContact, obOrganization));
    }).catch(function (err) {
        log.run(req, response(res).customError(err), logFile);
        response(res).failure(err);
    });
};

exports.delete = function (req, res) {
    var currentTime = new Date().getTime();
    var id = parseInt(req.params.id);


    dWM.deleteLead(req, res, [id], currentTime, 'lead_id', function () {
        response(res).success();
    });

};
var toEntity = function (entity, data, currentUser, action, contact_id, org_id) {

    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.amount = data.Amount;
    entity.isWon = data.Iswon;
    entity.expectedClouserDate = data.Expectedclouserdate;
    entity.expectedClouserDateTime = data.Expectedclouserdatetime;
    entity.isFresh = data.Isfresh;
    entity.commissionRate = data.Commissionrate;
    entity.lostReason = data.Lostreason;
    entity.prospectsDate = data.Prospectsdate;
    entity.contactedDate = data.Contacteddate;
    entity.proposalGivenDate = data.Proposalgivendate;
    entity.proposal_finalized_date = data.ProposalFinalizedDate;
    entity.inNegotiationDate = data.Innegotiationdate;
    entity.wonDate = data.Wondate;
    entity.lostDate = data.Lostdate;
    entity.currentState = data.Currentstate;
    entity.contact_id = contact_id;
    entity.amc_id = data.AmcId;
    entity.lead_source_id = data.LeadSourceId;
    entity.lead_source_sub_string = data.LeadSourceSubString;
    entity.employee_id = currentUser.EmployeeId;
    entity.product_id = data.ProductId;
    entity.organization_id = org_id;
    entity.seen = data.Seen || 1;
    entity.won_lost_by_employee_id = data.WonLostByEmployeeId;
    entity.won_lost_by_employee_name = data.WonLostByEmployeeName;
    entity.last_updated = new Date().getTime();
    entity.is_individual = data.IsIndividual;
    entity.opportunity = data.Opportunity;
    //entity.status_calculation_id = data.StatusCalculationId;
    entity.currentStatus = data.CurrentStatus;
    entity.rating = data.Rating;
    if (action == "create") {
        entity.initial_create = new Date().getTime();
        entity.last_updated = entity.initial_create;
    }


    return entity;
};


var toEntityUpdate = function (entity, data, currentUser, action) {

    entity.name = data.Name;
    entity.account_id = currentUser.AccountId;
    entity.amount = data.Amount;
    entity.isWon = data.Iswon;
    entity.expectedClouserDate = data.Expectedclouserdate;
    entity.expectedClouserDateTime = data.Expectedclouserdatetime;
    entity.isFresh = data.Isfresh;
    entity.commissionRate = data.Commissionrate;
    entity.lostReason = data.Lostreason;
    entity.prospectsDate = data.Prospectsdate;
    entity.contactedDate = data.Contacteddate;
    entity.proposalGivenDate = data.Proposalgivendate;
    entity.proposal_finalized_date = data.ProposalFinalizedDate;
    entity.inNegotiationDate = data.Innegotiationdate;
    entity.wonDate = data.Wondate;
    entity.lostDate = data.Lostdate;
    entity.currentState = data.Currentstate;
    entity.contact_id = data.ContactId;
    entity.amc_id = data.AmcId;
    entity.lead_source_id = data.LeadSourceId;
    entity.lead_source_sub_string = data.LeadSourceSubString;
    entity.employee_id = currentUser.EmployeeId;
    entity.product_id = data.ProductId;
    entity.seen = data.Seen || 1;
    entity.organization_id = data.OrganizationId;
    entity.won_lost_by_employee_id = data.WonLostByEmployeeId;
    entity.won_lost_by_employee_name = data.WonLostByEmployeeName;
    entity.last_updated = new Date().getTime();
    entity.is_individual = data.IsIndividual;
    return entity;
};

/*var whereClause = function (filters, currentUser, callback) {
 var clause = [{  }, { employee_id: currentUser.EmployeeId }];
 if (filters.timeStamp) {
 clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
 }
 callback(null, clause);
 };*/


function createOrganization(req, res, reqInfo, t, callback) {

    var obOrganization = null;
    if (req.body.Organization) {
        var objectOrganization = req.body.Organization;
        objectOrganization.name = objectOrganization.Name;
        objectOrganization.account_id = req.currentUser.AccountId;
        objectOrganization.short_name = objectOrganization.ShortName;
        objectOrganization.type = objectOrganization.Type;
        objectOrganization.phone_number = objectOrganization.PhoneNumber;
        objectOrganization.address = objectOrganization.Address;
        objectOrganization.employee_id = req.currentUser.EmployeeId;
        objectOrganization.initial_create = reqInfo.currentTime;
        objectOrganization.last_updated = reqInfo.currentTime;
        objectOrganization.ownership = objectOrganization.Ownership;
        objectOrganization.industry = objectOrganization.Industry;
        objectOrganization.revenue = objectOrganization.Revenue;
        objectOrganization.account_type = objectOrganization.AccountType;
        objectOrganization.employee_num = objectOrganization.EmployeeNum;
        objectOrganization.add_picklist_1 = objectOrganization.AddPicklist1;
        objectOrganization.add_picklist_2 = objectOrganization.AddPicklist2;
        objectOrganization.add_picklist_3 = objectOrganization.AddPicklist3;
        objectOrganization.add_num_field_1 = objectOrganization.AddNum1;
        objectOrganization.add_num_field_2 = objectOrganization.AddNum2;
        objectOrganization.add_text_field_1 = objectOrganization.AddText1;
        objectOrganization.add_text_field_2 = objectOrganization.AddText2;
        objectOrganization.add_date_field_1 = objectOrganization.AddDate1;
        objectOrganization.add_date_field_2 = objectOrganization.AddDate2;
        return db.organization.create(objectOrganization, {transaction: t}).then(function (org) {


            reqInfo.org_id = org.organization_id;
            callback(true);

        }).catch(function (err) {
            t.rollback();
            response(res).failure(err);
        });
    } else {

        if (req.body.OrganizationId) {

            db.organization.find(
                {
                    where: {organization_id: req.body.OrganizationId}
                }).then(function (o) {
                try {
                    obOrganization = o.toModel();
                    reqInfo.org_id = obOrganization.OrganizationId;

                } catch (e) {
                    obOrganization = null;
                }

                callback(obOrganization);

            });
        } else {
            callback(null);
        }

    }


}

function createContact(req, res, reqInfo, t, callback) {
    var obContact = null;
    if (req.body.Contact) {
        var objectContact = req.body.Contact;
        objectContact.name = objectContact.Name;
        objectContact.account_id = req.currentUser.AccountId;
        objectContact.number = objectContact.Number;
        objectContact.email = objectContact.Email;
        objectContact.address = objectContact.Address;
        objectContact.seen = objectContact.Seen || 1;
        objectContact.isLink = objectContact.IsLink;
        objectContact.employee_id = req.currentUser.EmployeeId;
        objectContact.organization_id = reqInfo.org_id || null;
        objectContact.initial_create = reqInfo.currentTime;
        objectContact.last_updated = reqInfo.currentTime;
        objectContact.age_group = objectContact.AgeGroup;
        objectContact.income = objectContact.Income;
        objectContact.dependent = objectContact.Dependent;
        objectContact.add_picklist_1 = objectContact.AddPicklist1;
        objectContact.add_picklist_2 = objectContact.AddPicklist2;
        objectContact.add_picklist_3 = objectContact.AddPicklist3;
        objectContact.add_num_field = objectContact.AddNum1;
        objectContact.add_num_field_2 = objectContact.AddNum2;
        objectContact.add_text_field_1 = objectContact.AddText1;
        objectContact.add_text_field_2 = objectContact.AddText2;
        objectContact.add_date_field_1 = objectContact.AddDate1;
        objectContact.add_date_field_2 = objectContact.AddDate2;
        return db.contact.create(objectContact, {transaction: t}).then(function (cont) {

            reqInfo.cont_id = cont.contact_id;
            callback(true);


        }).catch(function (err) {
            t.rollback();
            response(res).failure(err);
        });

    } else {


        if (req.body.ContactId) {

            db.contact.find(
                {
                    where: {contact_id: req.body.ContactId}

                }).then(function (c) {


                try {
                    reqInfo.cont_id = c.contact_id;
                    obContact = c.toModel();
                    //reqInfo.cont_id = obContact.ContactId;
                    //reqInfo.cont_id = req.body.ContactId;
                } catch (e) {


                    obContact = null;
                }

                callback(obContact);


            }).catch(function (err) {
                t.rollback();
                response(res).failure(err);

            });


        } else {

            callback(null);
        }

    }

}


function returnContact(obContact) {
    var jsonContact = {

        ContactId: obContact.contact_id,
        Name: obContact.name,
        Number: obContact.number,
        Email: obContact.email,
        Address: obContact.address,
        Seen: obContact.seen,
        IsLink: obContact.isLink,
        OrganizationId: obContact.organization_id,
        EmployeeId: obContact.employee_id,
        AgeGroup: obContact.age_group,
        Income: obContact.income,
        Dependent: obContact.dependent,
        AddPicklist1: obContact.add_picklist_1,
        AddPicklist2: obContact.add_picklist_2,
        AddPicklist3: obContact.add_picklist_3,
        AddNum1: obContact.add_num_field_1,
        AddNum2: obContact.add_num_field_2,
        AddText1: obContact.add_text_field_1,
        AddText2: obContact.add_text_field_2,
        AddDate1: obContact.add_date_field_1,
        AddDate2: obContact.add_date_field_2,

        InitialCreate: obContact.initial_create,
        LastUpdated: obContact.last_updated,
        //Active: obContact.active

    }


    return jsonContact;


}

function returnLeadStageCalcuation(obLSC, req) {

    var o = obLSC.map(function (c) {
        return c.toModel();
    });
    return o;

}

function returnNotes(obNote, req) {


    var o = obNote.map(function (c) {
        return c.toModel();
    });
    return o;
}

function returnNotesObject(obNotes, reqInfo, entity) {
    //// console.log("Temp notes is --->"+reqInfo.temp_notes);

    var realObNotes = [];
    var tempJson = {};

    for (var i in obNotes) {
        var note = obNotes[i];

        tempJson = {
            NoteId: note.note_id,
            // AccountId: note.account_id || null,
            Addedon: note.addedOn,
            AgentId: note.agent_id,
            ContactId: note.contact_id,
            EmployeeId: note.employee_id,
            LeadId: note.lead_id,
            IsRemoteSuccess: reqInfo.temp_notes[i].IsRemoteSuccess || null,
            LocalId: reqInfo.temp_notes[i].LocalId || null,
            RemoteExtra: reqInfo.temp_notes[i].RemoteExtra || null,
            RemoteMessage: reqInfo.temp_notes[i].RemoteMessage || null,
            MeetingId: note.meeting_id,
            Text: note.text,
            InitialCreate: note.initial_create,
            LastUpdated: note.last_updated

        }

        realObNotes.push(tempJson);

    }

    return realObNotes;

}


var createNotes = function (oNotes, req, res, entity, reqInfo, t, NoteResponse) {
    if (req.body.Notes) {

        //res.send(req.body.Notes);
        var objectNotes = oNotes;
        var realObjectNotes = [];

        var tempJson;
        var tempNotes = [];

        for (var i in objectNotes) {

            var note = objectNotes[i];
            tempNotes.push({
                IsRemoteSuccess: note.IsRemoteSuccess,
                LocalId: note.LocalId,
                RemoteExtra: note.RemoteExtra,
                RemoteMessage: note.RemoteMessage
            });
            tempJson = {
                account_id: req.currentUser.AccountId,
                addedOn: note.Addedon || null,
                agent_id: note.AgentId || null,
                contact_id: note.ContactId || null,
                lead_id: entity.lead_id || null,
                meeting_id: note.MeetingId || null,
                employee_id: req.currentUser.EmployeeId,
                initial_create: new Date().getTime(),
                last_updated: new Date().getTime(),
                text: note.Text

            }

            realObjectNotes.push(tempJson);
        }

        // res.send(realObjectNotes);
        reqInfo.temp_notes = tempNotes;

        return db.note.bulkCreate(realObjectNotes, {transaction: t}).then(function (notes) {


            NoteResponse(notes);

        }).catch(function (err) {
            t.rollback();
            response(res).failure(err);
        });
    } else {

        NoteResponse(null);
    }


}


function createLeadStageCalculations(LeadStageCalculations, req, res, entity, obContact, obOrganization, NotesOb, ir, localId) {
    if (req.body.LeadStageCalculation) {
        var objectLSC = req.body.LeadStageCalculation;
        var realObjectLSC = [];

        var tempJson;


        for (var i in objectLSC) {

            var lsc = objectLSC[i];

            tempJson = {
                account_id: req.currentUser.AccountId,
                active: lsc.Active || null,
                number_of_days: lsc.NumberOfDays || null,
                stage_name: lsc.StageName || null,
                status: lsc.Status || null,
                start_date: lsc.StartDate || null,
                end_date: lsc.EndDate || null,
                initial_position_level: lsc.InitialPositionLevel || null,
                updated_position_level: lsc.UpdatedPositionLevel || null,
                stage_setting_id: lsc.StageSettingId || null,
                lead_id: entity.lead_id,
                employee_id: entity.employee_id,
                initial_create: entity.initial_create,
                last_updated: entity.last_updated


            }

            realObjectLSC.push(tempJson);
        }

        db.lead_stage_calculation.bulkCreate(realObjectLSC).then(function (lsc) {

            db.lead_stage_calculation.findAll({

                where: {lead_id: entity.lead_id}
            }).then(function (lscObject) {
                var o = null;
                if (lscObject) {
                    o = lscObject.map(function (c) {
                        return c.toModel();
                    });
                }

                //log.run(req,o,"lead_stage_calculation.log.txt");

                //log.run(req,entity.toModelPost(obContact,obOrganization,o,NotesOb,ir,localId),"lead_log.txt");
                response(res).data(entity.toModelPost(obContact, obOrganization, o, NotesOb, ir, localId));

            }).catch(function (err) {
                response(res).failure(err);
            });


        }).catch(function (err) {

            response(res).failure(err);
        });

    } else {


    }


}


function createLeadStageCalculations2(LeadStageCalculations, req, res, reqInfo, entity, t, lscResponse) {
    if (req.body.LeadStageCalculation) {
        var objectLSC = req.body.LeadStageCalculation;
        var realObjectLSC = [];

        var tempJson;
        var tempLSC = [];


        for (var i in objectLSC) {

            var lsc = objectLSC[i];
            tempLSC.push({LocalId: lsc.LocalId || null});
            tempJson = {
                account_id: req.currentUser.AccountId,
                active: lsc.Active || 1,
                number_of_days: lsc.NumberOfDays || null,
                stage_name: lsc.StageName || null,
                status: lsc.Status || null,
                start_date: lsc.StartDate || null,
                end_date: lsc.EndDate || null,
                initial_position_level: lsc.InitialPositionLevel || null,
                updated_position_level: lsc.UpdatedPositionLevel || null,
                stage_setting_id: lsc.StageSettingId || null,
                lead_id: entity.lead_id,
                employee_id: entity.employee_id,
                initial_create: entity.initial_create,
                last_updated: entity.last_updated,


            }

            realObjectLSC.push(tempJson);
        }

        reqInfo.temp_lsc = tempLSC;

        return db.lead_stage_calculation.bulkCreate(realObjectLSC, {transaction: t}).then(function (lsc) {


            lscResponse(lsc);


        }).catch(function (err) {
            t.rollback();
            response(res).failure(err);
        });

    } else {

        lscResponse(true);
    }


}


function returnContactForGet(obContact, req) {
    var orgOb = null;

    try {
        orgOb = returnOrganization(obContact.organization, req);


    } catch (e) {
        orgOb = null;
    }

    var jsonContact = {

        ContactId: obContact.contact_id,
        Name: obContact.name,
        Number: obContact.number,
        Email: obContact.email,
        Address: obContact.address,
        IsLink: obContact.isLink,
        OrganizationId: obContact.organization_id || null,
        Organization: orgOb || null,
        EmployeeId: obContact.employee_id,
        Seen: obContact.seen,
        AgeGroup: obContact.age_group,
        Income: obContact.income,
        Dependent: obContact.dependent,
        AddPicklist1: obContact.add_picklist_1,
        AddPicklist2: obContact.add_picklist_2,
        AddPicklist3: obContact.add_picklist_3,
        AddNum1: obContact.add_num_field_1,
        AddNum2: obContact.add_num_field_2,
        AddText1: obContact.add_text_field_1,
        AddText2: obContact.add_text_field_2,
        AddDate1: obContact.add_date_field_1,
        AddDate2: obContact.add_date_field_2,


        InitialCreate: obContact.initial_create,
        LastUpdated: obContact.last_updated,
        //Active: obContact.active

    }


    return jsonContact;


}

function returnOrganization(obOrganization, req) {
    var jsonOrganization = {

        OrganizationId: obOrganization.organization_id,
        Name: obOrganization.name || null,
        ShortName: obOrganization.short_name || null,
        Type: obOrganization.type || null,
        PhoneNumber: obOrganization.phone_number || null,
        Address: obOrganization.address || null,
        EmployeeId: obOrganization.employee_id || null,
        Qwnership: obOrganization.ownership || null,
        Industry: obOrganization.industry || null,
        Revenue: obOrganization.revenue || null,
        AccountType: obOrganization.account_type || null,
        EmployeeNum: obOrganization.employee_num || null,
        AddPicklist1: obOrganization.add_picklist_1 || null,
        AddPicklist2: obOrganization.add_picklist_2 || null,
        AddPicklist3: obOrganization.add_picklist_3 || null,
        AddNum1: obOrganization.add_num_field_1 || null,
        AddNum2: obOrganization.add_num_field_2 || null,
        AddText1: obOrganization.add_text_field_1 || null,
        AddText2: obOrganization.add_text_field_2 || null,
        AddDate1: obOrganization.add_date_field_1 || null,
        AddDate2: obOrganization.add_date_field_2 || null,
        IsActive: obOrganization.active,

        InitialCreate: obOrganization.initial_create,
        LastUpdated: obOrganization.last_updated
    }

    return jsonOrganization;
}


var whereClause = function (req, res, filters, currentUser, callback) {
    var clause = [{}];
    var empArray = [];
    var emp = null;
    var q = null;
    var limit = 5;
    var offset = 0;
    // if (filters.timeStamp) {
    //     clause.push(sequelize.or([{ 'last_updated': { $ne: null } }, { 'last_updated': { $gte: filters.timeStamp } }], [{ 'last_updated': null }, { 'initial_create': { $gte: filters.timeStamp } }]));
    // }
    var aboveManager = 0;


    //res.send(aboveManager);

    db.access_level.findOne({
        where: {employee_id: currentUser.EmployeeId}
    }).then(function (al) {
        // console.log("Access Level is ------------------------------------------>");
        // console.log(al);

        if (al) {
            if (al.description == "Above Manager") {
                // console.log("User is Above Manger ---------------------------------------->");
                aboveManager = 1;
            }

        }


        if (al && al.access_level == 2) {
            // condition 1
            // console.log("condition 1 is called ---------------------------------------->");


            reportingPerson.all(req, res, currentUser.EmployeeId, function (empObject) {

                empObject.map(function (e) {

                    empArray.push(e.employee_id);
                });


                // console.log("Emp Array is--->"+empArray);


                if (filters.timestamp && filters.emp_id) {
                    empArray.push(currentUser.EmployeeId);
                    var empId = parseInt(filters.emp_id);

                    // console.log("INdex  Is--------->"+empArray.indexOf(empId));
                    if (empArray.indexOf(empId) != -1) {
                        if (aboveManager == 1) {
                            // console.log("Data for above manager ------------------------>");
                            q = {employee_id: filters.emp_id, last_updated: {$gt: filters.timestamp}};

                        } else {

                            q = {
                                $or: [{
                                    employee_id: filters.emp_id,
                                    last_updated: {$gt: filters.timestamp}
                                }, {
                                    lead_id: {in: [sequelize.literal('select lead_id from lead_log where old_employee_id =' + filters.emp_id)]},
                                    last_updated: {$gt: filters.timestamp},
                                    active: true
                                }]
                            };

                        }

                        callback(null, clause, q, limit, offset, al, true);


                    } else {
                        callback(null, clause, q, limit, offset, al, false);

                    }

                } else {

                    q = {employee_id: currentUser.EmployeeId, active: true};
                    if (filters.timestamp) {
                        q = {employee_id: currentUser.EmployeeId, last_updated: {$gt: filters.timestamp}, active: true};
                    }

                    callback(null, clause, q, limit, offset, al, true);
                }

            }); // end reporting person callback

        } else if ((al && al.access_level == 1) || aboveManager == 1) {
            // condition 2

            // console.log("condition 2 is called ----------->");

            if (filters.timestamp && filters.emp_id) {
                // condition 3
                // console.log("condition 3 is called ----------->");
                if (currentUser.EmployeeId == filters.emp_id) {
                    //  condition 3.1
                    // console.log("condition 3.1 is called ----------->");
                    q = {
                        $or: [{
                            employee_id: filters.emp_id,
                            last_updated: {$gt: filters.timestamp}
                        }, {
                            lead_id: {in: [sequelize.literal('select lead_id from lead_log where old_employee_id =' + filters.emp_id)]},
                            last_updated: {$gt: filters.timestamp},
                            active: true
                        }]
                    };
                    callback(null, clause, q, limit, offset, al, true);

                } else {
                    // condition 3.2

                    // console.log("condition 3.2 is called ----------->");
                    callback(null, clause, q, limit, offset, al, false);
                }


            } else {
                // condition 4
                // console.log("condition 4 is called ----------->");
                q = {employee_id: currentUser.EmployeeId, active: true};
                if (filters.timestamp) {
                    q = {employee_id: currentUser.EmployeeId, last_updated: {$gt: filters.timestamp}, active: true};
                }

                callback(null, clause, q, limit, offset, al, true);

            }


        } else {
            // condition 5
            // console.log("condition 5 is called ----------->");
            callback(null, clause, q, limit, offset, al, false);
        }


    });
};

var getAuthorizedUsers = function (req, res, callback) {

    var currentUser = req.currentUser;
    var empArray = [];
    db.lead.findOne({

        where: {lead_id: parseInt(req.params.id)},
        attributes: ['employee_id']
    }).then(function (ld) {

        //// console.log(ld);

        if (ld && ld.employee_id) {

            db.access_level.findOne({

                where: {employee_id: currentUser.EmployeeId},
                attributes: ['access_level'],
                group: ['access_level']


            }).then(function (al) {
                if (al && al.access_level == 2) {


                    reportingPerson.all(req, res, currentUser.EmployeeId, function (empObject) {
                        empObject.map(function (e) {

                            empArray.push(e.employee_id);
                        });

                        empArray.push(currentUser.EmployeeId);

                        var empId = parseInt(ld.employee_id);

                        if (empArray.indexOf(empId) != -1) {
                            callback(true);


                        } else {
                            callback(false);
                        }

                    });
                } else if (al && al.access_level == 1) {
                    var empId = parseInt(ld.employee_id);
                    if (currentUser.EmployeeId == empId) {

                        callback(true);
                    } else {

                        callback(false);
                    }


                } else {


                    callback(false);
                }


            });


        } else {

            response(res).failure("Lead not found !");
        }

    });


}


var toUpdate = function (data, req, res) {

    var entity = {};

    entity.name = data.Name;
    entity.account_id = req.currentUser.AccountId;
    entity.amount = data.Amount;
    entity.isWon = data.Iswon;
    entity.expectedClouserDate = data.Expectedclouserdate;
    entity.expectedClouserDateTime = data.Expectedclouserdatetime;
    entity.isFresh = data.Isfresh;
    entity.commissionRate = data.Commissionrate;
    entity.lostReason = data.Lostreason;
    entity.prospectsDate = data.Prospectsdate;
    entity.contactedDate = data.Contacteddate;
    entity.proposalGivenDate = data.Proposalgivendate;
    entity.proposal_finalized_date = data.ProposalFinalizedDate;
    entity.inNegotiationDate = data.Innegotiationdate;
    entity.wonDate = data.Wondate;
    entity.lostDate = data.Lostdate;
    entity.currentState = data.Currentstate;
    entity.contact_id = data.ContactId;
    entity.amc_id = data.AmcId;
    entity.lead_source_id = data.LeadSourceId;
    entity.lead_source_sub_string = data.LeadSourceSubString;
    //entity.employee_id = req.currentUser.EmployeeId;
    entity.seen = data.Seen || 1;
    entity.product_id = data.ProductId;
    entity.organization_id = data.OrganizationId;
    entity.won_lost_by_employee_id = data.WonLostByEmployeeId;
    entity.won_lost_by_employee_name = data.WonLostByEmployeeName;
    entity.last_updated = new Date().getTime();
    entity.is_individual = data.IsIndividual;
    entity.opportunity = data.Opportunity;
    // entity.status_calculation_id = data.StatusCalculationId;
    entity.currentStatus = data.CurrentStatus;
    entity.rating = data.Rating;
    return entity;
};


var toLcUpdate = function (lcData, ld, currentTime, req, res, action) {

    var entity = {};
    entity.account_id = req.currentUser.AccountId;
    entity.active = lcData.Active;
    entity.number_of_days = lcData.NumberOfDays;
    entity.stage_name = lcData.StageName;
    entity.status = lcData.status;
    entity.start_date = lcData.StartDate;
    entity.end_date = lcData.EndDate;
    entity.initial_position_level = lcData.InitialPositionLevel;
    entity.updated_position_level = lcData.UpdatedPositionLevel;
    entity.stage_setting_id = lcData.StageSettingId;
    entity.lead_id = ld.lead_id || null;
    entity.employee_id = ld.employee_id;
    if (action == "create")
        entity.initial_create = new Date().getTime();

    entity.last_updated = currentTime;

    return entity;


};


var toLStCUpdate = function (lcData, ld, currentTime, req, res, action) {

    var entity = {};
    entity.account_id = req.currentUser.AccountId;
    entity.active = lcData.Active;
    entity.number_of_days = lcData.NumberOfDays;
    entity.stage_name = lcData.StatusName;
    entity.status = lcData.Status;
    entity.start_date = lcData.StartDate;
    entity.end_date = lcData.EndDate;
    entity.initial_position_level = lcData.InitialPositionLevel;
    entity.updated_position_level = lcData.UpdatedPositionLevel;
    entity.status_setting_id = lcData.StatusSettingId;
    entity.lead_id = ld.lead_id || null;
    entity.employee_id = ld.employee_id;
    if (action == "create")
        entity.initial_create = new Date().getTime();

    entity.last_updated = currentTime;

    return entity;


};


var toPlmUpdate = function (plData, ld, currentTime, req, res, action) {

    var entity = {};
    entity.active = plData.Active;
    entity.account_id = req.currentUser.AccountId;
    entity.product_code = plData.ProductCode;
    entity.unit = plData.Unit;
    entity.amount = plData.Amount;
    entity.product_name = plData.ProductName;
    entity.close_date = plData.CloseDate;
    entity.stage = plData.Stage;
    entity.sub_product_id = plData.SubProductId;
    entity.sub_product_name = plData.SubProductName;
    entity.lead_id = ld.lead_id || null;
    entity.commission_rate = plData.CommissionRate;
    entity.employee_id = ld.employee_id;
    if (action == "create")
        entity.initial_create = new Date().getTime();

    entity.last_updated = currentTime;

    return entity;


};

var commitResponse = function (t, entity, currentTime, localIdRecords, localIdRecordsForStatusCalculation, localIdforProduct, req, res, localId, reqInfo, obOrg, obCot) {

    t.commit().then(function () {
        return db.lead.find({
            where: {lead_id: entity.lead_id},
            include: [
                {model: db.contact},
                {model: db.organization},
                {model: db.lead_stage_calculation, where: {last_updated: currentTime}, required: false},
                {model: db.lead_status_calculation, where: {last_updated: currentTime}, required: false},
                {model: db.product_lead_mapping, required: false},
                {model: db.note}
            ],


        }).then(function (lds) {

            // return res.send(lds);

            var obContact;
            var obOrganization;
            var obLeadStageCalculation;
            var obNotes;
            var obPLM;


            try {

                obContact = lds.contact.toModel();
                log.run(req, obContact, "contact_log.txt");


            } catch (e) {

                obContact = lds.contact || null;

                if (req.body.ContactId) {

                    obContact = obCot;

                }


            }


            try {
                obOrganization = lds.organization.toModel();
                log.run(req, obOrganization, "organization_log.txt");

                //log.run(req,obOrganization,"organization_log.txt");

            } catch (e) {
                obOrganization = lds.organization || null;

                if (req.body.OrganizationId) {

                    obOrganization = obOrg;


                }
            }


            var o = null;
            if (lds.lead_stage_calculations) {
                o = lds.lead_stage_calculations.map(function (c, i) {
                    var lsO = c.toModel();
                    lsO.LocalId = localIdRecords[c.stage_calculation_id] || null;
                    return lsO;
                });

                log.run(req, o, "lead_stage_calculation_log.txt");
            }

            var lo = null;

            if (lds.lead_status_calculations) {
                lo = lds.lead_status_calculations.map(function (c, i) {
                    var lsO = c.toModel();
                    lsO.LocalId = localIdRecordsForStatusCalculation[c.status_calculation_id] || null;
                    return lsO;
                });

                //log.run(req,o,"lead_stage_calculation_log.txt");
            }

            if (lds.product_lead_mappings) {

                obPLM = lds.product_lead_mappings.map(function (p) {
                    var plmO = p.toModel();
                    plmO.LocalId = localIdforProduct[p.id] || null;
                    return plmO;
                });

            } else {
                obPLM = null;
            }

            var NotesOb = null;

            if (lds.notes) {

                // NotesOb = lds.notes.map(function (c) {
                //             return c.toModel();
                //       });

                NotesOb = returnNotesObject(lds.notes, reqInfo, lds);

                log.run(req, NotesOb, "note_log.txt");
            }

            log.run(req, lds.toModelPost(obContact, obOrganization, o, lo, obPLM, NotesOb, null, localId), logFile);
            response(res).data(lds.toModelPost(obContact, obOrganization, o, lo, obPLM, NotesOb, null, localId, obPLM));


        });

    });
};


var getEmployee = function (id, cb) {

    db.employee.findOne({
        where: {employee_id: id}
    }).then(function (o) {
        cb(o);
    });

};
