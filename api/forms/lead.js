var forms = require('forms');
var fields = forms.fields;
var v = forms.validators;

var form = forms.create({
    Name: fields.string({
        required: v.required('Enter the name')
    }),
    Amount: fields.string({
        required: v.required('Enter the amount')
    }),
    IsWon: fields.boolean(),
    ExpectedClosureDate: fields.string(),
    IsFresh: fields.boolean(),
    CommissionRate: fields.string(),
    LostReason: fields.string(),
    leadSource:{
        Name: fields.string()
    },
    product: {
        Name: fields.string()
    },
    stateList: fields.array(),
    amc: {
        Name: fields.string()
    },
    organization: {
        Name: fields.string(),
        Address: fields.string(),
        ServerId: fields.number()
    },
    contact: {
        Name: fields.string(),
        Number: fields.string(),
        Email: fields.string(),
        Address: fields.string(),
        ServerId: fields.number()
    }
});

exports.CreateLead = form;
exports.UpdateLead = form;
