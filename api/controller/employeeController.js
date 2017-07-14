"use strict";
var async = require('async');
var db = require('../../models');
var _ = require('underscore');
//var randomString = require('randomstring');
var mailer = require('../../middleware/mailer');

var CreateForm = require('../forms/employee').CreateEmployee;
var UpdateForm = require('../forms/employee').UpdateEmployee;
var formHelper = require('../forms/helper');
var updateFields = require('../../lib/dbQuery').updateFields;


var getSupervisors = function (supervisorIds, employeeId, callback) {
    db.Employee.findById(employeeId).then(function (employee) {
        if (employee) {
            employee = employee.json();
            supervisorIds.push(employee.id);
        }

        if(employee && employee.supervisorId) {
            getSupervisors(supervisorIds, employee.supervisorId, callback);
        } else {
            callback(null, supervisorIds);
        }
    }).catch(callback);
};

var updateTeam = function (employeeId, supervisorId, callback) {
    db.Team.destroy({
        where: {
            memberId: employeeId
        }
    }).then(function () {
        var supervisorIds = [];

        getSupervisors(supervisorIds, supervisorId, function (err) {
            if (err) {
                return callback(err);
            }
            async.each(supervisorIds, function (id, cb) {
                db.Team.build({
                    supervisorId: id,
                    memberId: employeeId
                }).save().then(function () {
                    cb(null);
                }).catch(cb);
            }, callback);
        });
    }).catch(callback);

};

var createEmployee = function (data, callback) {
    var employee = db.Employee.build({
        name: data.name,
        code: data.code,
        userName: data.userName,
        designation: data.designation,
        password: data.password,
        EmployeeId: data.supervisorId || null
    });

    employee.save().then(function (newEmployee) {
        if (data.supervisorId) {
            return updateTeam(newEmployee.id, data.supervisorId, callback);
        }
        callback(null);
    }).catch(callback);
};

var updateEmployee = function (data, callback) {
    data.EmployeeId = data.supervisorId;

    async.waterfall(
        [
            function (wcallback) {
                db.Employee.findById(data.id).then(function (item) {
                    if (!item) {
                        wcallback("Cannot Find Employee");
                        return;
                    }
                    wcallback(null, item);
                }).catch(wcallback);
            },
            function (employee, wcallback) {
                var changedEmployee = updateFields({
                    fields: ['name', 'code', 'RoleId', 'userName', 'password', 'EmployeeId'],
                    newValues: data,
                    modelObj: employee
                });
                employee.save(changedEmployee).then(function (updatedEmployee) {
                    updatedEmployee = updatedEmployee.json();
                    updateTeam(updatedEmployee.id, updatedEmployee.supervisorId, wcallback);
                }).catch(wcallback);
            }
        ], callback
    );
};

exports.all = function (req, res) {
    db.Employee.findAll().then(function (cs) {
        res.json({
            IsSuccess: true,
            data: {
                Employee: cs.map(function (c) {
                    return c.json();
                })
            }
        });
    }).catch(function () {
        res.json({
            result: 'ok'
        });
    });
};

exports.create = function (req, res) {
    console.log(req.body);
    CreateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),
        error: formHelper.errorHandler(res),
        success: function (form) {
            createEmployee(form.data, function (err) {
                if (err) {
                    res.json({
                        result: 'error'
                    });
                    return;
                }
                res.json({
                    result: 'ok'
                });
            });
        }
    });
};

exports.getEmployee = function (req, res) {
    var id = req.params.id;
    db.Employee.findById(id).then(function (employee) {
        if (!employee) {
            res.json({
                result: 'error',
                message: 'no employee found'
            });
            return;
        }
        res.json({
            result: 'ok',
            isSuccess: true,
            data: employee.json()
        });
    }).catch(function (err) {
        res.json({
            result: 'error'
        });
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    db.Employee.destroy({
        where: {
            id: id
        }
    }).then(function () {
        res.json({
            result: 'ok'
        });
    }).catch(function () {
        res.json({
            result: 'error'
        });
    });
};

exports.update = function (req, res) {
    var id = req.params.id;
    console.log(req.body);
    UpdateForm.handle(req.body, {
        empty: formHelper.emptyHandler(res),

        error: formHelper.errorHandler(res),

        success: function (form) {
            var data = form.data;
            data.id = id;
            updateEmployee(data, function (err) {
                if (err) {
                    res.json({
                        IsSuccess: false
                    });
                    return;
                }
                res.json({
                    IsSuccess: true
                });
            });
        }
    });
};

exports.employeeTeam = function (req, res) {
    db.Employee.findAll({
        where :{
            EmployeeId: req.currentUser.id
        }
    })
        .then(function (cs) {
        res.json({
            IsSuccess: true,
            employees: cs.map(function (c) {
                return c.jsonEmployeeName();
            })
        });
    }).catch(function () {
        res.json({
            IsSuccess: false
        });
    });
};

exports.forgetPassword = function (req,res) {
    db.Employee.find({
        where:{
            userName: req.body.userName
        }
    })
        .then(function (user) {
            if (!user) {
                res.json({
                    success: false,
                    message: 'no employee found'
                });
                return;
            }
            else {
                var customMail = new mailer(user.userName, 'Forget Password', 'forgetPassword', {user: user});
                customMail.send();

            }
            res.json({
                success: true
            });
        })
        .catch(function (err) {
            res.json({
                IsSuccess: err
            });
        });
};