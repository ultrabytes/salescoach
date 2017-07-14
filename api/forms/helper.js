'use strict';
var formErrors = function (form) {
    var errors = {},
        field;

    for (field in form.fields) {
        if (form.fields[field].error) {
            errors[field] = form.fields[field].error;
        }
    }

    return errors;
};

exports.emptyHandler = function (res) {
    return function () {
        res.json({
            result: 'error',
            data: {
                form: 'form.missing-data'
            }
        });
    };
};

exports.errorHandler = function (res) {
    return function (form) {
        res.json({
            result: 'error',
            data: formErrors(form)
        });
    };
};
exports.errorView = function (res, view, message) {
    return function () {
        res.render(view, {
            message: message
        });
    };
};



