var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var moment = require('moment');
var FCM = require('fcm-node');
var severKey = 'AAAARCNNKRI:APA91bGwIaaysS3M9vGv-QYnOkTqjIiyWH3Jz3fPkLisqQlMhr-d85BjEBkodCDa4cu_Ha3umqZt5ES2g-CNoznqw6SImMfZm6ft4fSEB1CDQ8fv6V5XugNZUAe5XWyO2jxg7m0A8fge';
var fcm = new FCM(severKey);
var conn = require('../../config/mysql/db.js')();

var base_s3_asset = 'https://s3.ap-northeast-2.amazonaws.com/kusulang-asset/';

exports.home = function (req, res, next) {
  res.render('statics/home.pug');
}

exports.count_article = function (req, res, next) {

  var sql = 'SELECT _id, title, views FROM Article '
  + 'ORDER BY _id DESC'

  conn.query(sql, [], function(err, results, fields) {
    if(err) {
      console.log('count_article select err : '+err);
      res.send('count_article select err : '+err);
    } else {
      res.render('statics/views_num_list.pug', {
        results: results,
        list_tab: 'article',
        status: req.session.status
      });
    }
  })

}

exports.count_user = function (req, res, next) {

  var sql = 'SELECT DATE_FORMAT(reg_date, \'%Y-%m-%d\') AS date, '
  + 'count(*) AS count FROM User GROUP BY DATE_FORMAT(reg_date, \'%Y-%m-%d\')'
  + 'ORDER BY reg_date DESC'

  conn.query(sql, [], function(err, results, fields) {
    if(err) {
      console.log('count_user_reg select err : '+err);
      res.send('count_user_reg select err : '+err);
    } else {

      var sql = 'SELECT count(*) AS count '
      + 'FROM User'
      conn.query(sql, [], function(total_err, total_results, total_fields){
        if(total_err) {
          console.log('total select err : '+total_err);
          res.send('total select err : '+total_err);
        } else {
          res.render('statics/date_num_list.pug', {
            results: results,
            total: total_results[0].count,
            list_tab: 'user',
            status: req.session.status
          });
        }
      })
    }
  })

}

exports.count_review = function (req, res, next) {

  var sql = 'SELECT DATE_FORMAT(write_date, \'%Y-%m-%d\') AS date, '
  + 'count(*) AS count FROM Review GROUP BY DATE_FORMAT(write_date, \'%Y-%m-%d\')'
  + 'ORDER BY write_date DESC'

  conn.query(sql, [], function(err, results, fields) {
    if(err) {
      console.log('count_review select err : '+err);
      res.send('count_review select err : '+err);
    } else {

      var sql = 'SELECT count(*) AS count '
      + 'FROM Review'
      conn.query(sql, [], function(total_err, total_results, total_fields){
        if(total_err) {
          console.log('total select err : '+total_err);
          res.send('total select err : '+total_err);
        } else {
          res.render('statics/date_num_list.pug', {
            results: results,
            total: total_results[0].count,
            list_tab: 'review',
            status: req.session.status
          });
        }
      })
    }
  })

}

exports.count_banner = function (req, res, next) {

  selectBannerHome(function(home_results) {
    selectBannerSearch(function(search_results){
      var results = {};
      results['home'] = home_results;
      results['search'] = search_results;

      res.render('statics/img_num_list.pug', {
        results: results,
        list_tab: 'banner',
        status: req.session.status
      });
    });
  });

}

exports.count_login = function (req, res, next) {

  selectSummaryLogin(function(results) {
    res.render('statics/basic_list.pug', {
      results: results,
      list_tab: 'login',
      status: req.session.status
    });
  })

}

function selectSummaryLogin (callback) {
  var sql = 'SELECT DATE_FORMAT(date, \'%Y-%m-%d\') AS date, people_num, login_num FROM SummaryLogin '
  + 'ORDER BY date DESC'
  conn.query(sql, [], function(err, results, fields) {
    if(err) {
      console.log('SummaryLogin Select err : '+err);
    } else {
      callback(results);
    }
  })
}

function selectBannerSearch (callback) {
  var sql = 'SELECT bs._id, st.name, bs.enable, '
  + 'CONCAT(?, bs.img) AS img, count(*) AS count FROM BannerSearch AS bs '
  + 'JOIN HistoryBannerSearch AS hbs ON bs._id = hbs.banner_id '
  + 'LEFT JOIN Store AS st ON bs.data2 = st._id '
  + 'GROUP BY bs._id '
  conn.query(sql, [base_s3_asset+'banners/'], function(err, results, fields) {
    if(err) {
      console.log('BannerSearch Select Err : '+err);
    } else {
      callback(results);
    }
  })
}

function selectBannerHome (callback) {
  var sql = 'SELECT bh._id, st.name, bh.enable, '
  + 'CONCAT(?, bh.img) AS img, count(*) AS count FROM BannerHome AS bh '
  + 'JOIN HistoryBannerHome AS hbh ON bh._id = hbh.banner_id '
  + 'LEFT JOIN Store AS st ON bh.data2 = st._id '
  + 'GROUP BY bh._id '
  conn.query(sql, [base_s3_asset+'banners/'], function(err, results, fields) {
    if(err) {
      console.log('BannerHome Select Err : '+err);
    } else {
      callback(results);
    }
  })
}
