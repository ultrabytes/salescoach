var forms = require('forms');
var fields = forms.fields;

var form = forms.create({
    Time: fields.string(),
    Schedule: fields.string(),
    Purpose: fields.string(),
    CompletedOn: fields.string(),
    Location: fields.string(),
    ReviewedOn: fields.string(),
    ReviewStatus: fields.number(),
    Q1: fields.string(),
    Q2: fields.string(),
    Q3: fields.string(),
    Q4: fields.string(),
    Q5: fields.string(),
    LeadStageName: fields.string(),
    LeadStageData: fields.string(),
    Notes: fields.string(),
    meetingType:{
        Type: fields.string()
    },
    noteList: fields.array(),
    contact: {
        Name: fields.string(),
        Number: fields.string(),
        Email: fields.string(),
        Address: fields.string(),
        ServerId: fields.number()
    },
    lead: {
        Name: fields.string(),
        Amount: fields.string(),
        IsWon: fields.boolean(),
        ExpectedClosureDate: fields.string(),
        IsFresh: fields.boolean(),
        CommissionRate: fields.string(),
        LostReason: fields.string(),
        ServerId: fields.number(),
        amc: {
            Name: fields.string(),
            productId: fields.number()
        },
        organization: {
            Name: fields.string(),
            Address: fields.string()
        },
        product: {
            Name: fields.string()
        },
        leadSource:{
            Name: fields.string()
        }
    }
});

exports.CreateMeeting = form;
exports.UpdateMeeting = form;
