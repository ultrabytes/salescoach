"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
var randomstring = require('just.randomstring');
var nodemailer = require('nodemailer');

exports.forgetPassword = function (req, res) {

    var transporter = nodemailer.createTransport({
        host: 'smtp.19thmile.com',
        port: 587,
        auth: {user: 'ashutosh.singh@19thmile.com', pass: 'aniket23march'},
        secure: false,
        tls: {
            rejectUnauthorized: false
        }
    });
    var generatedPassword = randomstring(5) + "" + new Date().getTime();
    var mailOptions = {
        from: '"SalesCoach - Forgot Password" <ashutosh.singh@19thmile.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Forgot Password', // Subject line
        //text: 'Hello world', // plaintext body
        html: 'Your Access Code for Forgot Password is: <b>' + generatedPassword + '</b>'// html body
    };

    // transporter.sendMail(mailOptions, function(error, info){

    db.employee.count({
        where: {email: req.body.email},

    }).then(function (emp) {


        if (emp > 0) {


            db.forgot_password.create({
                email: req.body.email,
                access_code: generatedPassword
            }).then(function (c) {

                transporter.sendMail(mailOptions, function (error, info) {

                    if (error) {
                        response(res).failure(error);
                    } else {

                        res.json({
                            success: true,
                            ErrorCode: 100,
                            message: 'Check your email to get Access Code for update password.',
                            ServerCurrentTime: new Date().getTime(),
                        });

                    }


                });


            }).catch(function (err) {
                response(res).failure(err);
            });
        } else {
            response(res).failure("User not found !");
        }


    });


};


exports.forgetPasswordConfirm = function (req, res) {

    db.employee.count({
        where: {email: req.body.email}
    }).then(function (c) {

        if (c > 0) {
            db.forgot_password.count({
                where: {email: req.body.email, access_code: req.body.access_code}
            }).then(function (cf) {

                if (cf > 0) {

                    db.employee.update({password: req.body.password}, {
                        where: {email: req.body.email}
                    }).then(function (u) {


                        db.forgot_password.destroy({
                            where: {email: req.body.email}
                        }).then(function () {

                            res.json({
                                success: true,
                                ErrorCode: 100,
                                message: 'Your password updated successfully.',
                                ServerCurrentTime: new Date().getTime(),
                            });


                        }).catch(function (err) {
                            response(res).failure(err);
                        });


                    }).catch(function (err) {
                        response(res).failure(err);
                    });

                } else {
                    response(res).failure("Unable to update password.");
                }

            }).catch(function (err) {
                response(res).failure(err);
            });
        } else {
            response(res).failure("User not found.");
        }
    }).catch(function (err) {
        response(res).failure(err);
    });

};