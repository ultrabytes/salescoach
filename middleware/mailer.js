var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var ejs = require('ejs');
var config = require('../settings/config');

var CustomMail = function (to, subject, template, content){
    this.to = to;
    this.subject = subject;
    this.template = template;
    this.content = content;
};

var transporter = nodemailer.createTransport(smtpTransport({
    host: config.mailer.host,
    port: config.mailer.port,
    auth: {
        user: config.mailer.auth.user,
        pass: config.mailer.auth.pass
    }
}));

CustomMail.prototype.send = function (callback){
    var isCallback = (typeof  callback) === undefined;
    var template = config.root + '/views/template/' +this.template+'.ejs';
    var content = this.content;
    var to = this.to;
    var subject = this.subject;

    fs.readFile(template, 'utf8', function (err, file){
        if(err) return;

        var html = ejs.render(file, content);

        var mailOptions = {
            from: config.mailer.defaultFromAddress,
            to: to,
            subject: subject,
            html: html
        };
        transporter.sendMail(mailOptions);
        //transporter.sendMail(mailOptions, function (err, info){
        //    if(err) return isCallback || callback(err);
        //    isCallback || callback();
        //});
    });
};

module.exports = CustomMail;