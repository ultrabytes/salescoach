var forms = require('forms');
var fields = forms.fields;
var v = forms.validators;

var form = forms.create({
    Name: fields.string({
        required: v.required('Enter the name')
    }),
    Number: fields.string({
        required: v.required('Enter the number')
    }),
    Email: fields.string(),
    Address: fields.string(),
    noteList: fields.array(),
    organization:{
        Name: fields.string(),
        Address: fields.string(),
        ServerId: fields.number()
    }
});

exports.CreateContact = form;
exports.UpdateContact = form;
