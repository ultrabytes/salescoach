var forms = require('forms');
var fields = forms.fields;
var v = forms.validators;

var form = forms.create({
    Name: fields.string(),
    Reminder: fields.string(),
    DueDate: fields.string(),
    CompletedOn: fields.string(),
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
        leadSource:{
            Name: fields.string()
        },
        product: {
            Name: fields.string()
        },
        amc: {
            Name: fields.string(),
            productId: fields.number()
        },
        organization: {
            Name: fields.string(),
            Address: fields.string()
        }
    }
});

exports.CreateTask = form;
exports.UpdateTask = form;
