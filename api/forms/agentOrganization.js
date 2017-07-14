var forms = require('forms');
var fields = forms.fields;
var v = forms.validators;

var form = forms.create({
    Name: fields.string({
        required: v.required('Enter the organization name')
    })
});

exports.CreateAgentOrganization = form;
exports.UpdateAgentOrganization = form;