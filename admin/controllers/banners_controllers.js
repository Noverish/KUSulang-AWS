var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var moment = require('moment');
var FCM = require('fcm-node');
var severKey = 'AAAARCNNKRI:APA91bGwIaaysS3M9vGv-QYnOkTqjIiyWH3Jz3fPkLisqQlMhr-d85BjEBkodCDa4cu_Ha3umqZt5ES2g-CNoznqw6SImMfZm6ft4fSEB1CDQ8fv6V5XugNZUAe5XWyO2jxg7m0A8fge';
var fcm = new FCM(severKey);
var conn = require('../../config/mysql/db.js')();

exports.banners_list = function(req, res, next) {

  var _select = req.params.select;
  var sql = 'SELECT * FROM '

  switch (_select) {
    case 'home':
    sql = sql + 'BannerHome '

      break;
    case 'search':
    sql = sql + 'BannerSearch '

      break;
    case 'article':
    sql = sql + 'BannerArticle '

      break;
    case 'announce':
    sql = sql + 'Announce '

      break;
    default:
    res.send('not exist');
  }

  conn.query(sql, [], function(err, results, fie){
    if(err) {
      console.log('list select err : '+err);
      res.send('list select err : '+err);
    } else {

    }
  })

}

exports.banner_list = function(req, res, next) {

}
