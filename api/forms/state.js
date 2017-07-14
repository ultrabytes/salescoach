var forms = require('forms');
var fields = forms.fields;

var form = forms.create({
    name: fields.string(),
    date: fields.string(),
    isCurrent: fields.boolean(),
    MeetingId: fields.number(),
    LeadId: fields.number()
});

exports.CreateState = form;
exports.UpdateState = form;
