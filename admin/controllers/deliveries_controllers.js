var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var moment = require('moment');
var FCM = require('fcm-node');
var severKey = 'AAAARCNNKRI:APA91bGwIaaysS3M9vGv-QYnOkTqjIiyWH3Jz3fPkLisqQlMhr-d85BjEBkodCDa4cu_Ha3umqZt5ES2g-CNoznqw6SImMfZm6ft4fSEB1CDQ8fv6V5XugNZUAe5XWyO2jxg7m0A8fge';
var fcm = new FCM(severKey);
var conn = require('../../config/mysql/db.js')();

var config_confirm_key = '0bd9f6dd716003f3818d15d2e211ee73';

var delivery_config;
getDeliveryConfig();

function getDeliveryConfig() {
  request.get({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url: 'http://localhost:9000/kusulang/v1/configs/delivery'
  }, function(error, response, body){
    if(error) {
      console.log(error);
    } else {
      var json = JSON.parse(body);
      delivery_config = json;
    }
  });
}

function sendAdminPush(admin_user_id, callback) {
  var sql =
  'SELECT us.token AS token, hl.is_android AS is_android FROM User AS us '
  + 'LEFT JOIN HistoryLoginNew AS hl ON us._id = hl.user_id '
  + 'WHERE us._id = ?'
  conn.query(sql, [admin_user_id], function(err_token, results_token, fie_token){
    if(err_token) {
      console.log('token select err : '+err_token);
      res.send('token select err : '+err_token);
    } else {
      var token = results_token[0].token;
      console.log('getadmintoken - '+token);
      callback(token);

    }
  })
}

exports.today_list = function(req, res, next) {

  var sql =
  'SELECT @rownum:=@rownum+1 AS num, de._id, '
  + 'DATE_FORMAT(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, DATE_FORMAT(de.chosen_time, \'%Y-%m-%d %H:%i:%s\') AS chosen_time, '
  + 'de.orderer_name, us.user_name, de.user_id, '
  + 'de.contact, de.is_school, de.address1, de.address2, de.address3, de.payment, de.note, de.status AS delivery_status, dr.img AS deliverer_img '
  + 'FROM Delivery AS de '
  + 'LEFT OUTER JOIN Deliverer AS dr '
  + 'ON de.deliverer_id = dr._id '
  + 'LEFT OUTER JOIN User AS us '
  + 'ON de.user_id = us._id '
  + 'INNER JOIN (SELECT @rownum:=0) T1 '
  + 'WHERE DATE_FORMAT(de.request_time, \'%Y-%m-%d\') = DATE_FORMAT(now(), \'%Y-%m-%d\') '
  + 'ORDER BY @rownum DESC '

  conn.query(sql, [], function(err, results, fie){
    if(err) {
      console.log('list select err : '+err);
      res.send('list select err : '+err);
    } else {

      var sql =
      'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
      + 'FROM DeliveryItem AS di '
      + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '

      var values = [];
      var where_id = 'WHERE ';

      if(results != 0) {
        for (key in results) {
          where_id = where_id + 'di.delivery_id = '+results[key]['_id'];
          results[key]['items'] = [];
          if(key < results.length - 1) {
            where_id = where_id + ' or '
          }
        }
      } else {
        where_id = '';
      }
      values.push(where_id);

      conn.query(sql + values, function(items_err, items_res, items_fields) {
        if(items_err) {
          console.log('today_list items select err : '+items_err);
        } else {
          for (key in items_res) {
            var items_delivery_id = items_res[key]['delivery_id'];
            for (data_key in results) {
              if(results[data_key]['_id'] == items_delivery_id) {
                results[data_key]['items'].push(items_res[key]);
              }
            }
          }
          res.render('deliveries/delivery_list.pug', {
            results: results,
            list_tab: 'today',
            status: req.session.status
          });
        }
      });

    }
  })

}

exports.all_list = function(req, res, next) {

  var sql =
  'SELECT @rownum:=@rownum+1 AS num, de._id, '
  + 'DATE_FORMAT(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, DATE_FORMAT(de.chosen_time, \'%Y-%m-%d %H:%i:%s\') AS chosen_time, '
  + 'de.orderer_name, us.user_name, de.user_id, '
  + 'de.contact, de.is_school, de.address1, de.address2, de.address3, de.payment, de.note, de.status AS delivery_status, dr.img AS deliverer_img '
  + 'FROM Delivery AS de '
  + 'LEFT OUTER JOIN Deliverer AS dr '
  + 'ON de.deliverer_id = dr._id '
  + 'LEFT OUTER JOIN User AS us '
  + 'ON de.user_id = us._id '
  + 'INNER JOIN (SELECT @rownum:=0) T1 '
  + 'ORDER BY @rownum DESC '

  conn.query(sql, [], function(err, results, fie){
    if(err) {
      console.log('list select err : '+err);
      res.send('list select err : '+err);
    } else {
      var sql =
      'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
      + 'FROM DeliveryItem AS di '
      + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '

      var values = [];
      var where_id = 'WHERE ';

      if(results != 0) {
      for (key in results) {
          where_id = where_id + 'di.delivery_id = '+results[key]['_id'];
          results[key]['items'] = [];
          if(key < results.length - 1) {
            where_id = where_id + ' or '
          }
        }
      } else {
        where_id = '';
      }
      values.push(where_id);

      conn.query(sql + values, function(items_err, items_res, items_fields) {
        if(items_err) {
          console.log('all_list items select err : '+items_err);
        } else {
          for (key in items_res) {
            var items_delivery_id = items_res[key]['delivery_id'];
            for (data_key in results) {
              if(results[data_key]['_id'] == items_delivery_id) {
                results[data_key]['items'].push(items_res[key]);
              }
            }
          }
          res.render('deliveries/delivery_list.pug', {
            results: results,
            list_tab: 'all',
            status: req.session.status
          });
        }
      });
    }
  })

}

exports.deliverer_select = function(req, res, next) {

  var id = req.params.id;
  var delivery_status = req.body.delivery_status;

  console.log(delivery_status);

  if(delivery_status != 0) {
    console.log(delivery_status);
    // res.redirect('../');
  }

  var sql =
  'SELECT * FROM Deliverer '

  conn.query(sql, function(err, results, fie){
    if(err) {
      console.log('list select err : '+err);
      res.send('list select err : '+err);
    } else {
      res.render('deliveries/deliverer_select.pug', {
        id: id,
        results: results,
        status: req.session.status
      });
    }
  })

}

exports.delivery_deliverable = function(req, res, next) {

  var deliverable = req.body.deliverable;

  var delivery_deliverable_request = request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url: 'http://localhost:9000/kusulang/v1/configs/delivery/deliverable',
    form: {
      config_key: config_confirm_key,
      is_deliverable: deliverable
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
    } else {
      var json = JSON.parse(body);
      console.log(json);
      getDeliveryConfig();
      res.redirect('./');
    }
  });

}

exports.delivery_setting = function(req, res, next) {
  getDeliveryConfig();
  res.render('deliveries/delivery_setting.pug', {
    config: delivery_config,
    list_tab: 'setting',
    status: req.session.status
  });
}

exports.delivery_time_modify = function(req, res, next) {

  var start_hour = req.body.startHour;
  var end_hour = req.body.endHour;

  var delivery_modify_request = request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url: 'http://localhost:9000/kusulang/v1/configs/delivery/schedule/modify',
    form: {
      config_key: config_confirm_key,
      start_hour: start_hour,
      end_hour: end_hour
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
    } else {
      var json = JSON.parse(body);
      console.log(json);
      getDeliveryConfig();
      res.redirect('./');
    }
  });
}

exports.view = function(req, res, next) {

  var id = req.params.id;

  var sql =
  'SELECT de._id, de.orderer_name, us.user_name, de.contact, '
  + 'de.payment, de.price, de.is_school, de.address1, de.address2, de.address3, de.note, de.status AS delivery_status, de.status_msg, dr.img AS deliverer_img, '
  + 'DATE_FORMAT(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, DATE_FORMAT(de.chosen_time, \'%Y-%m-%d %H:%i:%s\') AS chosen_time, '
  + 'DATE_FORMAT(de.start_time, \'%Y-%m-%d %H:%i:%s\') AS start_time, DATE_FORMAT(de.complete_time, \'%Y-%m-%d %H:%i:%s\') AS complete_time '
  + 'FROM Delivery AS de '
  + 'LEFT OUTER JOIN Deliverer AS dr '
  + 'ON de.deliverer_id = dr._id '
  + 'LEFT OUTER JOIN User AS us '
  + 'ON de.user_id = us._id '
  + 'WHERE de._id = ? '

  conn.query(sql, [id], function(err, results, fie){
    if(err) {
      console.log('list select err : '+err);
      res.send('list select err : '+err);
    } else {

      results[0]['items'] = [];

      var sql =
      'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
      + 'FROM DeliveryItem AS di '
      + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '
      + 'WHERE '

      var where_id = 'di.delivery_id = '+id;

      conn.query(sql + where_id, function(items_err, items_res, items_fields) {
        if(items_err) {
          console.log('delivery_info items select err : '+items_err);
        } else {
          console.log(items_res);
          for (key in items_res) {
            results[0]['items'].push(items_res[key]);
          }
          if(items_res.length == 0) {
            results[0]['items'] = '';
          }
          res.render('deliveries/view.pug', {
            id: id,
            results: results,
            status: req.session.status
          });
        }
      });

    }
  })

}

exports.test = function(req, res, next) {

  var id = req.params.id;
  var delivery_status = req.body.delivery_status;
  var _results = [{
    _id: 1,
    name: 'test',
    img: 'https://s3.ap-northeast-2.amazonaws.com/kusulang-asset/deliverer/deliverer_001.png'
  },
  {
    _id: 1,
    name: 'test',
    img: 'https://s3.ap-northeast-2.amazonaws.com/kusulang-asset/deliverer/deliverer_001.png'
  }]

  res.render('deliveries/deliverer_select.pug', {
    id: id,
    results: _results,
    status: req.session.status
  });

}

exports.status_cancel = function(req, res, next) {
  getDeliveryConfig();

  // var admin_token = getAdminToken(delivery_config.admin_token);

  var id = req.params.id;
  var _delivery_status = req.body.delivery_status;
  var _status_msg = req.body.cancel_status_msg;

  var sql;
  var sql_select = 'UPDATE Delivery SET ? '
  var sql_where = 'WHERE _id = ? '

  var update_data = {};

  update_data = {
    status: 5,
    status_msg: _status_msg
  };

  sql = sql_select + sql_where;

  conn.query(sql, [update_data, id], function(err, results, fields) {
    if(err) {
      console.log('status_cancel err : '+err);
      res.send('status_cancel err : '+err);
    } else {
      var sql =
      'SELECT us.token AS token, hl.is_android AS is_android FROM User AS us '
      + 'LEFT JOIN HistoryLoginNew AS hl ON us._id = hl.user_id '
      + 'INNER JOIN Delivery AS de ON de.user_id = us._id '
      + 'WHERE de._id = ?'
      conn.query(sql, [id], function(err_token, results_token, fie_token){
        if(err) {
          console.log('token select err : '+err_token);
          res.send('token select err : '+err_token);
        } else {
          var is_android = results_token[0].is_android;
          if(is_android == 1) {
            console.log('is_android 1 - '+is_android);
          } else {
            is_android = 0;
            console.log('is_android 0 - '+is_android);
          }
          console.log('token - '+results_token[0].token);
          send_fcm(is_android, '쿠슐랭 배달', '주문하신 배달내역이 취소되었습니다.', results_token[0].token);
          res.redirect('../');
        }
      })

    }
  });
}

exports.status_modify = function(req, res, next) {

  getDeliveryConfig();

  // var admin_token = delivery_config.admin_token;
  // console.log('modify admin_token - '+admin_token);

  var id = req.params.id;
  var _delivery_status = req.body.delivery_status;
  var _deliverer_id;
  var _delivery_id;

  var sql;
  var sql_select = 'UPDATE Delivery SET ? '
  var sql_where = 'WHERE _id = ? '

  var update_data = {};

  switch (_delivery_status) {

    case '0': // 주문완료 -> 라이더 선정 -> 라이더 출발
      _deliverer_id = req.body.deliverer_id;
      _delivery_id = req.body.delivery_id;

      sql_select = sql_select+', chosen_time = now() ';
      update_data = {
        status: 2,
        deliverer_id: _deliverer_id
      };
      break;

    case '1': // Deprecated 라이더 선정 -> 라이더 출발
      update_data = {
        status: 2
      };
      break;

    case '2': // 라이더 출발 -> 음식 배달
      sql_select = sql_select+', start_time = now() ';
      update_data = {
        status: 3
      };
      break;

    case '3': // 음식 배달 -> 배달 완료
      var _price = req.body.price;
      var _status_msg = req.body.status_msg;
      if(_price === undefined || _price === '') {
        res.send('가격을 적어주세요.');
        break;
      }
      sql_select = sql_select+', complete_time = now() ';
      update_data = {
        status: 4,
        price: _price,
        status_msg: _status_msg
      };
      console.log(update_data);
      console.log(_status_msg);
      break;

    case '4': // 배달 완료 ->
      break;
    case '5': // 배달 취소 ->
      break;
    case '6': // 주문 취소 ->
      break;
    default:
  }

  sql = sql_select + sql_where;

  conn.query(sql, [update_data, id], function(err, results, fields) {
    if(err) {
      console.log('status_modify err : '+err);
      res.send('status_modify err : '+err);
    } else {

      if(_delivery_status == 0 && _delivery_id !== undefined && _deliverer_id !== undefined) { // deliverer select send fcm
        var sql =
        'SELECT us.token AS token, hl.is_android AS is_android FROM User AS us '
        + 'LEFT JOIN HistoryLoginNew AS hl ON us._id = hl.user_id '
        + 'INNER JOIN Delivery AS de ON de.user_id = us._id '
        + 'WHERE de._id = ?'
        conn.query(sql, [_delivery_id], function(err_token, results_token, fie_token){
          if(err) {
            console.log('token select err : '+err_token);
            res.send('token select err : '+err_token);
          } else {
            var is_android = results_token[0].is_android;
            if(is_android == 1) {
              console.log('is_android 1 - '+is_android);
            } else {
              is_android = 0;
              console.log('is_android 0 - '+is_android);
            }
            console.log('token - '+results_token[0].token);
            send_fcm(is_android, '라이더가 선정되었습니다.', '음식을 수령하려 가고 있으니, 조금만 기다려주세요!', results_token[0].token);
            res.redirect('./');
          }
        })
      } else if (_delivery_status == 2 && _delivery_id !== undefined && _deliverer_id !== undefined) {

      } else if (_delivery_status == 2 && id !== undefined) { // deliverer start delivery

        var sql =
        'SELECT us.token AS token, hl.is_android AS is_android FROM User AS us '
        + 'LEFT JOIN HistoryLoginNew AS hl ON us._id = hl.user_id '
        + 'INNER JOIN Delivery AS de ON de.user_id = us._id '
        + 'WHERE de._id = ?'
        conn.query(sql, [id], function(err_token, results_token, fie_token){
          if(err) {
            console.log('token select err : '+err_token);
            res.send('token select err : '+err_token);
          } else {
            var is_android = results_token[0].is_android;
            if(is_android == 1) {
              console.log('is_android 1 - '+is_android);
            } else {
              is_android = 0;
              console.log('is_android 0 - '+is_android);
            }
            console.log('token - '+results_token[0].token);
            send_fcm(is_android, '음식을 수령하였습니다.', '주문하신 음식이 곧 배달됩니다! (평균 11분 소요)', results_token[0].token);
            sendAdminPush(delivery_config.admin_token, function(token){
              send_fcm(1, 'KU-'+id, '음식을 받아 출발했습니다.', token);
            });
            res.redirect('./');
          }
        })

      } else if(_delivery_status == 3 && id !== undefined) { // delivery complete
        sendAdminPush(delivery_config.admin_token, function(token){
          send_fcm(1, 'KU-'+id, '배달이 완료되었습니다.', token);
        });
        res.redirect('./');

      } else {
        res.redirect('./');
      }

    }
  });

}

function send_fcm(is_android, title, content, token) {

  var message = {};
  if(is_android == 1) { // android
    message = {
      to: token,
      data: {  //you can send only notification or only data(or include both)
          title: title,
          content: content
      }
    };
  } else { // not android
    message = {
      to: token,
      notification: {
          title: title,
          body: content
      }
    };
  }

  fcm.send(message, function(err, response){
      if (err) {
        console.log('fcm err : '+err);
        return err;
      } else {
        return response;
      }
  });
}
