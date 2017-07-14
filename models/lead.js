"use strict";
module.exports = function(sequelize , DataTypes){
    var Lead = sequelize.define('lead', {
        lead_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        amount: DataTypes.STRING,
        isWon: DataTypes.INTEGER,
        expectedClouserDate: DataTypes.BIGINT,
        expectedClouserDateTime: DataTypes.BIGINT,
        isFresh: DataTypes.INTEGER,
        commissionRate: DataTypes.STRING,
        lostReason: DataTypes.STRING,
        prospectsDate: DataTypes.BIGINT,
        contactedDate: DataTypes.BIGINT,
        proposalGivenDate: DataTypes.BIGINT,
        proposal_finalized_date: DataTypes.BIGINT,
        inNegotiationDate: DataTypes.BIGINT,
        wonDate: DataTypes.BIGINT,
        lostDate: DataTypes.BIGINT,
        currentState: DataTypes.INTEGER,
        contact_id: DataTypes.INTEGER,
        amc_id: DataTypes.INTEGER,
        lead_source_id: DataTypes.INTEGER,
        lead_source_sub_string: DataTypes.STRING,
        employee_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        organization_id: DataTypes.INTEGER,
        seen: DataTypes.INTEGER,
        won_lost_by_employee_id: DataTypes.INTEGER,
        won_lost_by_employee_name:DataTypes.STRING,
        isReassigned: DataTypes.BOOLEAN,
        initial_create: DataTypes.BIGINT,
        last_updated: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN,
        stage_calculation_id: DataTypes.INTEGER,
        is_individual: DataTypes.INTEGER,
        opportunity: DataTypes.INTEGER,
        rating: DataTypes.STRING,
        status_calculation_id: DataTypes.INTEGER,
        currentStatus: DataTypes.INTEGER


    },{
        instanceMethods: {
            toModel: function (contactObject,organizationObject,obLeadStageCalculation,obLeadStatusCalculation,obNotes,obLeadProdInfo,leadDocMapping,IsReassigned) {
                var entity = this;
                var contact_id=null;
                var organization_id = null;
                if(contactObject)
                {
                    contact_id = contactObject.ContactId;
                }

                if(organizationObject)
                {
                    organization_id = organizationObject.OrganizationId;
                }

                if(!IsReassigned)
                {
                    var IsReassigned = 0;
                }


                var obj = {
                    LeadId: entity.lead_id,
                    Name: entity.name,
                    Amount: entity.amount,
                    Iswon: entity.isWon,
                    Expectedclouserdate: entity.expectedClouserDate,
                    Expectedclouserdatetime: entity.expectedClouserDateTime,
                    Isfresh: entity.isFresh,
                    Commissionrate: entity.commissionRate,
                    Lostreason: entity.lostReason,
                    Prospectsdate: entity.prospectsDate,
                    Contacteddate: entity.contactedDate,
                    Proposalgivendate: entity.proposalGivenDate,
                    ProposalFinalizedDate: entity.proposal_finalized_date,
                    Innegotiationdate: entity.inNegotiationDate,
                    Wondate: entity.wonDate,
                    Lostdate: entity.lostDate,
                    Currentstate: entity.currentState,
                    ContactId: contact_id,
                    Contact: contactObject || null,
                    AmcId: entity.amc_id,
                    LeadSourceId: entity.lead_source_id,
                    LeadSourceSubString: entity.lead_source_sub_string,
                    EmployeeId: entity.employee_id,
                    //organization: org || {},
                    ProductId:entity.product_id,
                    OrganizationId: organization_id,
                    Organization : organizationObject || null,
                    IsReassigned: IsReassigned,
                    WonLostByEmployeeName : entity.won_lost_by_employee_name,
                    WonLostByEmployeeId : entity.won_lost_by_employee_id,
                    LeadStageCalculation: obLeadStageCalculation,
                    LeadStatusCalculation: obLeadStatusCalculation,
                    LeadProdInfo: obLeadProdInfo || null,
                    LeadDocMapping: leadDocMapping,
                    Notes: obNotes || null,
                    Seen: entity.seen,
                    IsActive: entity.active,
                    IsIndividual: entity.is_individual,
                    StageCalculationId: entity.stage_calculation_id,
                    Opportunity: entity.opportunity,
                    StatusCalculationId: entity.status_calculation_id,
                    CurrentStatus: entity.currentStatus,
                    Rating: entity.rating,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };

                return obj;
            },
            toModelPost: function (contactObject,organizationObject,obLeadStageCalculation,obLeadStatusCalculation,obPLM,obNotes,IsReassigned,localId,stageCalculationId) {
                var entity = this;
                var contact_id=null;
                var organization_id = null;
                if(contactObject)
                {
                    contact_id = contactObject.ContactId;
                }

                if(organizationObject)
                {
                    organization_id = organizationObject.OrganizationId;
                }

                if(!IsReassigned)
                {
                    var IsReassigned = 0;
                }


                var obj = {
                    LeadId: entity.lead_id,
                    LocalId:localId || null,
                    Name: entity.name,
                    Amount: entity.amount,
                    Iswon: entity.isWon,
                    Expectedclouserdate: entity.expectedClouserDate,
                    Expectedclouserdatetime: entity.expectedClouserDateTime,
                    Isfresh: entity.isFresh,
                    Commissionrate: entity.commissionRate,
                    Lostreason: entity.lostReason,
                    Prospectsdate: entity.prospectsDate,
                    Contacteddate: entity.contactedDate,
                    Proposalgivendate: entity.proposalGivenDate,
                    ProposalFinalizedDate: entity.proposal_finalized_date,
                    Innegotiationdate: entity.inNegotiationDate,
                    Wondate: entity.wonDate,
                    Lostdate: entity.lostDate,
                    Currentstate: entity.currentState,
                    ContactId: contact_id,
                    Contact: contactObject || null,
                    AmcId: entity.amc_id,
                    LeadSourceId: entity.lead_source_id,
                    LeadSourceSubString: entity.lead_source_sub_string,
                    EmployeeId: entity.employee_id,
                    //organization: org || {},
                    ProductId:entity.product_id,
                    OrganizationId: organization_id,
                    Organization : organizationObject || null,
                    IsReassigned: IsReassigned,
                    WonLostByEmployeeName : entity.won_lost_by_employee_name,
                    WonLostByEmployeeId : entity.won_lost_by_employee_id,
                    LeadStageCalculation: obLeadStageCalculation,
                    LeadStatusCalculation: obLeadStatusCalculation,
                    LeadProdInfo: obPLM,
                    StageCalculationId: entity.stage_calculation_id || null,
                    Seen: entity.seen,
                    Notes: obNotes || null,
                    IsActive: entity.active,
                    IsIndividual: entity.is_individual,
                    Opportunity: entity.opportunity,
                    StatusCalculationId: entity.status_calculation_id,
                    CurrentStatus: entity.currentStatus,
                    Rating: entity.rating,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };

                return obj;
            },
            toModelUpdate: function () {
                var entity = this;

                var obj = {
                    LeadId: entity.lead_id,
                    Name: entity.name,
                    Amount: entity.amount,
                    Iswon: entity.isWon,
                    Expectedclouserdate: entity.expectedClouserDate,
                    Expectedclouserdatetime: entity.expectedClouserDateTime,
                    Isfresh: entity.isFresh,
                    Commissionrate: entity.commissionRate,
                    Lostreason: entity.lostReason,
                    Prospectsdate: entity.prospectsDate,
                    Contacteddate: entity.contactedDate,
                    Proposalgivendate: entity.proposalGivenDate,
                    ProposalFinalizedDate: entity.proposal_finalized_date,
                    Innegotiationdate: entity.inNegotiationDate,
                    Wondate: entity.wonDate,
                    Lostdate: entity.lostDate,
                    Currentstate: entity.currentState,
                    ContactId: entity.contact_id,
                    //Contact: contactObject || null,
                    AmcId: entity.amc_id,
                    LeadSourceId: entity.lead_source_id,
                    LeadSourceSubString: entity.lead_source_sub_string,
                    EmployeeId: entity.employee_id,
                    //organization: org || {},
                    ProductId:entity.product_id,
                    OrganizationId: entity.organization_id,
                    //Organization : organizationObject || null,
                    IsReassigned: 0,
                    WonLostByEmployeeName : entity.won_lost_by_employee_name,
                    WonLostByEmployeeId : entity.won_lost_by_employee_id,
                    StageCalculationId: entity.stage_calculation_id,
                    Seen: entity.seen,
                    IsActive: entity.active,
                    IsIndividual: entity.is_individual,
                    Opportunity: entity.opportunity,
                    StatusCalculationId: entity.status_calculation_id,
                    CurrentStatus: entity.currentStatus,
                    Rating: entity.rating,
                    InitialCreate: entity.initial_create,
                    LastUpdated: entity.last_updated
                };

                return obj;
            }



        },freezeTableName: true,
    });




    return Lead;
};
