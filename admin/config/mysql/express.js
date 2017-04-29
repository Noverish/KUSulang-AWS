module.exports = function() {
  var pug = require('pug');
  var express = require('express');
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');
  var AWS = require('aws-sdk');
  var fs = require('fs');
  var gm = require('gm');
  var s3 = new AWS.S3();
  AWS.config.region = 'ap-northeast-2';

  var app = express();

  app.set('views', '/admin/views');
  app.set('view engine', 'pug');

  app.use(bodyParser.urlencoded({ extended: false }));
  // app.use(session({
  //   secret: '1234DSFs@adf1234!@#$asd',
  //   resave: false,
  //   saveUninitialized: true,
  //   store:new MySQLStore({
  //     host:'db.ziumcompany.net',
  //     user:'ziumofficial',
  //     password:'zntbffod1!',
  //     database:'dbziumofficial'
  //   })
  // }));
  return app;
};
