/*
Tracking controllers
*/
var express = require('express');
var app = express();
var request = require('request');
var conn = require('../config/mysql/db.js')();

conn.on('error', function(err) {
  if(err) {
    var json = {}
    var msg;
    for (var val in err) {
      if (object.hasOwnProperty(val)) {
        msg = msg + exception(val) + '\n';
      }
    }
    json['res'] = '0';
    json['msg'] = msg;
    res.status(200).json(json);
  }
});

exports.history_menu_tag = function(req, res, next) {
  insert_history(req, res, 'HistoryMenuTag', 'menu_tag', req.body.menu_tag);
}
exports.history_banner_home = function(req, res, next) {
  insert_history(req, res, 'HistoryBannerHome', 'banner_id', req.body.banner_id);
}
exports.history_banner_article = function(req, res, next) {
  insert_history(req, res, 'HistoryBannerArticle', 'banner_id', req.body.banner_id);
}
exports.history_banner_search = function(req, res, next) {
  insert_history(req, res, 'HistoryBannerSearch', 'banner_id', req.body.banner_id);
}

function insert_history(req, res, from_table, column, value) {

  var user_token = req.body.user_token;
  var is_android = req.body.is_android;
  var app_version = req.body.app_version;

  var sql =
  'INSERT INTO '+from_table
  + '(user_id, is_android, app_version, '+column+', date) '
  + 'VALUES (?, ?, ?, ?, now())'

  conn.query(sql, [user_token, is_android, app_version, value], function(err, results, fields){
    var json = {};
    if(err) {
      console.log('history insert err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results;
      json = results_json(json, '1');
      res.status(200).json(json);
    }
  });

  console.log(sql);
}

function results_json(json, successful, err) {
  if(successful === '0') { // fail
    json['res'] = '0';
    json['msg'] = err;
    return json;
  } else if (successful === '1') { // success
    json['res'] = '1';
    json['msg'] = '';
    return json;
  }
}
