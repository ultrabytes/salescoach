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
    Age: fields.string(),
    Income: fields.number(),
    Experience: fields.boolean(),
    Status: fields.number(),
    organization: {
        Name : fields.string()
    },
    stageList: fields.array()
});

exports.CreateAgent = form;
exports.UpdateAgent = form;
