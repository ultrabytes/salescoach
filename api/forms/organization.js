var forms = require('forms');
var fields = forms.fields;
var v = forms.validators;

var form = forms.create({
    Name: fields.string({
        required: v.required('Enter the name')
    }),
    Address: fields.string(),
    LinkPerson: fields.string(),
    contact :{
        Name: fields.string(),
        Number: fields.string(),
        Email: fields.string(),
        Address : fields.string(),
        ServerId: fields.number()
    }
});

exports.CreateOrganization = form;
exports.UpdateOrganization = form;
