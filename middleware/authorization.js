"use strict";
var jwt = require('jsonwebtoken');
var db = require('../models');

exports.requiresToken = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, "jaspreet", function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    ErrorCode: 111,
                    message: 'Failed to authenticate token.',
                    error: err,
                    data: token
                });
            } else {
                req.currentUser = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            ErrorCode: 111,
            message: 'No token provided.'
        });
    }
};

exports.requireAdmin = function (req, res, next) {
    var id = req.currentUser.RoleId;
    db.role.findById(id).then(function (role) {
        if (!role) {
            res.json({
                success: false,
                ErrorCode: 119,
                message: 'No role assigned to current user'
            });
            return;
        }
        if (role.designation === "Manager" || role.designation === "Supervisor" || role.designation === "Director" || role.designation === "CEO" ) {
            next();
        }
        else {
            res.json({
                success: false,
                ErrorCode: 119,
                message: 'You are not authorize user'
            });
        }
    }).catch(function (err) {
        res.json({
            success: 'error'
        });
    });
};

exports.checkUser = function (req, res, next) {
    //var id = req.currentUser.Id;
    db.employee.find({
        where: {
            employee_id: req.currentUser.EmployeeId
        }
    }).then(function (emp) {
        if(emp) {
            if (emp.status == 1)
                return res.json({success: false, ErrorCode: 119, message: 'User Left Organization'});
            else if (emp.status == 2)
                return res.json({success: false, ErrorCode: 119, message: 'User unauthorized'});
            else
                next();
        }else{
            return res.json({success: false, ErrorCode: 119, message: 'User not found.'});
        }
        
    }).catch(function (err) {

        res.json({
            success: false,
            message: 'error'
        });
    })
};


