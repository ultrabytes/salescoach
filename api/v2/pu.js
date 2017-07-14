"use strict";
var async = require('async');
var response = require('../../helpers/response');
var _ = require('underscore');
var moment = require('moment');
var sequelize = require('sequelize');
const crypto = require('crypto');
exports.submit = function (req, res) {

    var password = req.body.Password;
    const cipher = crypto.createCipher('aes-256-ctr', 'iudi987987198234@#$1d@#$&$jdfjl343');
    //const cipher2 = crypto.createCipher('aes-256-ctr', 'ask2');

    var encrypted = cipher.update(password,'utf8', 'hex');
	encrypted += cipher.final('hex');
	// console.log("encrypted1----->"+encrypted);
    res.json({Encryption: encrypted });
    
	// var encrypted2 = cipher2.update(encrypted,'utf8','hex');
	// encrypted2 += cipher2.final('hex');
	// // console.log("encrypted2----->"+encrypted2);
	// res.json({Encryption: encrypted2});


}