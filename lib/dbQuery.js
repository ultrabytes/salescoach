"use strict";

exports.updateFields = function (data) {
    var changedFields = [],
        index,
        field,
        newValue;

    for (index in data.fields) {
        field = data.fields[index];

        newValue = data.newValues[field];
        if (data.modelObj[field] !== newValue) {
            changedFields.push(field);
            data.modelObj[field] = newValue;
        }
    }

    return changedFields;
};

