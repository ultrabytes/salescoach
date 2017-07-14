var forms = require('forms');
var fields = forms.fields;
var v = forms.validators;

var form = forms.create({
    name: fields.string({
        required: v.required('Enter the name')
    }),
    code: fields.string({
        required: v.required('Enter the code')
    }),
    userName: fields.string(),
    designation: fields.string(),
    password: fields.string(),
    supervisorId: fields.number()
});

exports.CreateEmployee = form;
exports.UpdateEmployee = form;
