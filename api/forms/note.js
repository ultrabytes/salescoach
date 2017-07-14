var forms = require('forms');
var fields = forms.fields;

var form = forms.create({
    Text: fields.string(),
    AddedOn: fields.string(),
    contact: {
        Name: fields.string(),
        ServerId: fields.number()
    },
    meeting: {
        Time: fields.string(),
        ServerId: fields.number()
    },
    lead: {
        Name: fields.string(),
        ServerId: fields.number()
    }
});

exports.CreateNote = form;
exports.UpdateNote = form;
