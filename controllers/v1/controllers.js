var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var conn = require('../../config/mysql/db.js')();
var FCM = require('fcm-node');
var severKey = 'AAAARCNNKRI:APA91bGwIaaysS3M9vGv-QYnOkTqjIiyWH3Jz3fPkLisqQlMhr-d85BjEBkodCDa4cu_Ha3umqZt5ES2g-CNoznqw6SImMfZm6ft4fSEB1CDQ8fv6V5XugNZUAe5XWyO2jxg7m0A8fge';
var fcm = new FCM(severKey);

var sql_FROM_ArticleWriter = 'ArticleWriter ';
var sql_FROM_Article = 'Article ';
var sql_FROM_ArticleComment = 'ArticleComment ';
var sql_FROM_Announce = 'Announce ';
var sql_FROM_BannerHome = 'BannerHome ';
var sql_FROM_BannerSearch = 'BannerSearch ';
var sql_FROM_BannerArticle = 'BannerArticle ';
var sql_FROM_User = 'User ';
var sql_FROM_Delivery = 'Delivery ';
var sql_FROM_DeliveryItem = 'DeliveryItem ';

var base_s3_asset = 'https://s3.ap-northeast-2.amazonaws.com/kusulang-asset/';

var page_size = '20';

/**
todo : img url paste, use model
**/

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

exports.store_old = function(req, res, next) {
  var id = req.params.id;
  var image = req.file;

  fs.rename(image.destination + image.filename, image.destination + image.originalname, function(){
    var upload_request = request.post({
      headers: {'content-type' : 'multipart/form-data'},
      url:     'http://localhost:9000/store/'+id
      }, function(error, response, body){
      console.log(error);
      var json = JSON.parse(body);
      fs.unlink(image.destination + image.originalname);
      res.status(200).json(json);
    });

    var form = upload_request.form();
    form.append('image', fs.createReadStream(image.destination + image.originalname));
  });
};

exports.announce_list = function(req, res, next) {
    var page = req.query.page;
    var page_offset = page_size * (page - 1);
    var sql =
    'SELECT _id AS announce_id, CONCAT(? ,img) AS img, url, date_format(date, \'%Y-%m-%d %H:%i:%s\') AS date '
    + 'FROM ' + sql_FROM_Announce
    + 'ORDER BY _id DESC '
    + 'LIMIT ?, ?'

    conn.query(sql, [base_s3_asset+'announce/', parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
      var json = {};
      if(err) {
        console.log('announce_list select err : '+err);
        json = results_json(json, '0', err);
        res.status(200).json(json);
      } else {
        json = results_json(json, '1');
        json['data'] = results;
        res.status(200).json(json);
      }
    });
}

/*
writer_id	article_id	img	title	like_num	comment_num	date
writer_id	article_id	img	title	like_num	comment_num	date
*/
exports.article_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var user_token = req.query.user_token;

  var sql =
  'SELECT ar.writer_id, ar._id AS article_id, ar.img, ar.title, '
  + '(SELECT count(*) FROM ArticleLike AS al WHERE al.article_id = ar._id) as like_num, '
  + '(SELECT count(*) FROM ArticleComment AS ac WHERE ac.article_id = ar._id) as comment_num, '
  + 'date_format(ar.date, \'%Y-%m-%d %H:%i:%s\') AS date '
  + 'FROM '+sql_FROM_Article+' AS ar '
  + 'ORDER BY article_id DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

/*
img	title	url	like_num	comment_num	date
img	title	url	like_num	comment_num	date Y-m-d H:i:s
*/
exports.article_info = function(req, res, next) {
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.query.user_token;

  var sql =
  'SELECT ar.img, ar.title, ar.url, '
  + '(SELECT count(*) FROM ArticleLike AS al WHERE al.article_id = ar._id) as like_num, '
  + '(SELECT count(*) FROM ArticleComment AS ac WHERE ac.article_id = ar._id) as comment_num, '
  + 'date_format(ar.date, \'%Y-%m-%d %H:%i:%s\') AS date, '
  + '(SELECT count(*) FROM ArticleLike AS al WHERE al.user_id = ? AND al.article_id = ? ) AS is_user_liked '
  + 'FROM '+sql_FROM_Article+' AS ar '
  + 'WHERE ar._id = ? '

  conn.query(sql, [parseInt(user_token), parseInt(article_id), parseInt(article_id)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_info select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      if(results[0] != undefined) {
        json = results[0];
        json = results_json(json, '1');
        res.status(200).json(json);
      } else {
        json['res'] = '1';
        json['msg'] = '';
        res.status(200).json(json);
      }
    }
  });
}

// Not Include 작성자인지 아닌지 구분
exports.article_comment_info = function(req, res, next) {

  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var comment_id = req.params.comment_id;

  var sql =
  'SELECT ac._id AS comment_id, ac.user_id, us.user_name, us.is_owner, ac.content, date_format(ac.date, \'%Y-%m-%d %H:%i:%s\') AS date '
  + 'FROM '+sql_FROM_ArticleComment+' AS ac '
  + 'JOIN User AS us ON ac.user_id = us._id '
  + 'WHERE ac._id = ? and ac.article_id = ? '

  conn.query(sql, [parseInt(comment_id), parseInt(article_id)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_info select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      if(results[0] != undefined) {
        json = results[0];
        json = results_json(json, '1');
        res.status(200).json(json);
      } else {
        json['res'] = '1';
        json['msg'] = '';
        res.status(200).json(json);
      }
    }
  });
}

// not complete todo:작성자, 아티클, 유저 확인
exports.article_comment_modify = function(req, res, next) {

  var comment_id = req.params.comment_id;
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.body.user_token;
  var _content = req.body.content;

  var sql =
  'UPDATE ' + sql_FROM_ArticleComment
  + 'SET ? '
  + 'WHERE _id = ? and article_id = ? and user_id = ?'

  conn.query(sql, [{content: _content}, comment_id, article_id, user_token], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_modify update err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      console.log(results);
      // json['comment_id'] = results.insertId;
      res.status(200).json(json);
    }
  });

}

// not complete todo:작성자, 아티클, 유저 확인
exports.article_comment_delete = function(req, res, next) {

  var comment_id = req.params.comment_id;
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.body.user_token;

  var sql =
  'DELETE FROM ' + sql_FROM_ArticleComment
  + 'WHERE _id = ? and article_id = ? and user_id = ?'

  conn.query(sql, [comment_id, article_id, user_token], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_delete update err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      console.log(results);
      res.status(200).json(json);
    }
  });

}

// Not Include 작성자인지 아닌지 구분
exports.article_comment_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;

  var sql =
  'SELECT ac._id AS comment_id, ac.user_id, us.user_name, us.is_owner, ac.content, date_format(ac.date, \'%Y-%m-%d %H:%i:%s\') AS date '
  + 'FROM '+sql_FROM_ArticleComment+' AS ac '
  + 'JOIN User AS us ON ac.user_id = us._id '
  + 'WHERE ac.article_id = ? '
  + 'ORDER BY date DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [article_id, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

// Not Include compare writer_id
exports.article_comment_write = function(req, res, next) {

  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.body.user_token;
  var content = req.body.content;

  var sql =
  'INSERT INTO ' +sql_FROM_ArticleComment+ ' (article_id, user_id, content, date) '
  + 'VALUES (?, ?, ?, now()) '

  conn.query(sql, [article_id, user_token, content], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['comment_id'] = results.insertId;
      res.status(200).json(json);
    }
  });

}

exports.banner_home = function(req, res, next) {
  var sql =
  'SELECT _id AS banner_id, CONCAT(? ,img) AS img, behave, data, data2 '
  + 'FROM ' + sql_FROM_BannerHome + ' WHERE enable = 1'
  conn.query(sql, [base_s3_asset+'banners/'], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('banner_home select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

exports.banner_article = function(req, res, next) {
  var sql =
  'SELECT _id AS banner_id, CONCAT(? ,img) AS img, behave, data, data2 '
  + 'FROM ' + sql_FROM_BannerArticle + ' WHERE enable = 1'
  conn.query(sql, [base_s3_asset+'banners/'], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('banner_home select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

exports.banner_search = function(req, res, next) {
  var sql =
  'SELECT _id AS banner_id, CONCAT(? ,img) AS img, behave, data, data2 '
  + 'FROM ' + sql_FROM_BannerSearch + ' WHERE enable = 1'
  conn.query(sql, [base_s3_asset+'banners/'], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('banner_home select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

exports.delivery_deliverable_store = function(req, res, next) {
  var sql =
  'SELECT pl._id as place_id, st.name as place_name '
  + 'FROM Place AS pl '
  + 'JOIN ((SELECT _id, name FROM Truck) UNION (SELECT _id, name FROM Store) UNION (SELECT _id, name FROM Place)) AS st '
  + 'ON st._id = pl._id '
  + 'WHERE pl.is_deliverable = 1 '

  conn.query(sql, function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

/*
params: is_school	is_street
data(array): name
*/
exports.delivery_deliverable_address = function(req, res, next) {
  var is_school = req.query.is_school;
  var is_street = req.query.is_street;

  var sql =
  'SELECT name '

  if(is_school == 1) { // 교내
    sql = sql + 'FROM AddressSchool '
  } else {
    if(is_street == 1) { // 교내 X, 도로명
      sql = sql + 'FROM AddressStreet '
    } else if(is_street == 0 ){ // 교내 X, 지번
      sql = sql + 'FROM AddressDong '
    }
  }

  conn.query(sql, [], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('delivery_deliverable_address select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

//not complete
exports.delivery_deliverable_time = function(req, res, next) {

  // var sql =
  // 'SELECT name '
  //
  // conn.query(sql, [], function(err, results, fields) {
  //   var json = {};
  //   if(err) {
  //     console.log('delivery_deliverable_time select err : '+err);
  //     json = results_json(json, '0', err);
  //     res.status(200).json(json);
  //   } else {
  //     json = results_json(json, '1');
  //     json['is_deliverable'] = 1;
  //     res.status(200).json(json);
  //   }
  // });
  var json = {};
  json = results_json(json, '1');
  json['is_deliverable'] = 0;
  res.status(200).json(json);
}

/*
params : user_token, page
data
주문시각 주문자이름 특이사항	배달상태
request_time orderer_name note	status
items - place_id place_name menu note
*/
exports.delivery_list = function(req, res, next) {

  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var user_token = req.query.user_token;

  var sql =
  'SELECT de._id, de.orderer_name, date_format(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, de.note, de.status '
  + 'FROM Delivery AS de '
  + 'WHERE de.user_id = ? '
  + 'LIMIT ?, ?'

  conn.query(sql, [user_token, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('delivery_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {

      json['data'] = results;
      var sql =
      'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
      + 'FROM DeliveryItem AS di '
      + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '

      var values = [];
      var where_id = 'WHERE ';

      if(results != 0) {
        for (key in json['data']) {
          where_id = where_id + 'di.delivery_id = '+json['data'][key]['_id'];
          json['data'][key]['items'] = [];
          if(key < json['data'].length - 1) {
            where_id = where_id + ' or '
          }
        }
      } else {
        where_id = '';
      }
      values.push(where_id);

      conn.query(sql + values, function(items_err, items_res, items_fields) {
        if(items_err) {
          console.log('delivery_list items select err : '+items_err);
          json = results_json(json, '0', items_err);
          res.status(200).json(json);
        } else {

          for (key in items_res) {
            var items_delivery_id = items_res[key]['delivery_id'];
            for (data_key in json['data']) {
              if(json['data'][data_key]['_id'] == items_delivery_id) {
                json['data'][data_key]['items'].push(items_res[key]);
              }
            }
          }

          json = results_json(json, '1');
          res.status(200).json(json);
        }
      });
    }
  });
}

/* 확인필요
params : delivery_id, user_token
orderer_name contact	is_school	address1	address2	address3	payment	note
items{delivery_id, place_id, menu, note}
*/
exports.delivery_request = function(req, res, next) {

  var admin_token = 'dlLo5zHF7RI:APA91bHM2t4MoTogodFl6c_ubSbUqBCu0XrOZalQv4qXcVdjHpICAyzMh805S2YiS4-I3g7wfn85wAkzEo3VnH_GZh2sMiUeoApvAlvcP8Ii5ooAZ1KEc4mb2ssCRggBu-nMxsG0KHG6';

  var user_token = req.body.user_token;
  var is_android = req.body.is_android;

  var items = req.body.items;

  var orderer_name = req.body.orderer_name;
  var contact = req.body.contact;
  var is_school = req.body.is_school;
  var address1 = req.body.address1;
  var address2 = req.body.address2;
  var address3 = req.body.address3;
  var payment = req.body.payment;
  var note = req.body.note;

  var sql =
  'SELECT token FROM User '
  + 'WHERE _id = ?';

  conn.query(sql, [user_token], function(sel_err, sel_results, sel_fields){
    if(sel_err) {
      console.log('delivery_request select err : '+sel_err);
      json = results_json(json, '0', sel_err);
      res.status(200).json(json);
    } else {
      var sql =
      'INSERT INTO ' +sql_FROM_Delivery
      + '(user_id, orderer_name, contact, is_school, address1, address2, address3, payment, note, request_time) '
      + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now()) '

      conn.query(sql,
        [user_token, orderer_name, contact, is_school, address1, address2, address3, payment, note],
        function(ins_err, ins_results, ins_fields) {
        var json = {};
        if(ins_err) {
          console.log('delivery_request insert err : '+ins_err);
          json = results_json(json, '0', ins_err);
          res.status(200).json(json);
        } else {
          json['delivery_id'] = ins_results.insertId;

          var json_items = JSON.parse(items);
          for (var key in json_items) {
            if(!json_items[key]['note']) {
              json_items[key]['note'] = '';
            }
          }

          var sql =
          'INSERT INTO ' +sql_FROM_DeliveryItem
          + '(delivery_id, place_id, menu, note) '
          + 'VALUES '

          var values = [];

          for (key in json_items) {
            values.push('('+ins_results.insertId+', '+json_items[key]['place_id']+', \"'+
            json_items[key]['menu']+'\", \"'+json_items[key]['note']+'\")');
          }

          conn.query(sql+values, function(items_insert_err, items_insert_res, items_insert_fields){
            if(items_insert_err) {
              console.log('delivery_request items_insert err : '+items_insert_err);
              json = results_json(json, '0', items_insert_err);
              res.status(200).json(json);
            } else {

              conn.query(
                'SELECT de._id, date_format(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, de.address1, de.address2, de.address3 FROM '+sql_FROM_Delivery+'AS de WHERE _id = ?'
                , [ins_results.insertId], function(con_err, con_res, con_fie){
                if(con_err) {
                  console.log('delivery_request confirm err : '+con_err);
                  json = results_json(json, '0', con_err);
                  res.status(200).json(json);
                } else {

                  conn.query(
                    'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
                    + 'FROM DeliveryItem AS di '
                    + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '
                    + 'WHERE delivery_id = '+con_res[0]._id,
                    function(di_con_err, di_con_res, di_con_fie) {
                      if(di_con_err) {
                        console.log('delivery_request items confirm err : '+di_con_err);
                        json = results_json(json, '0', di_con_err);
                        res.status(200).json(json);
                      } else {
                        console.log(di_con_res);
                        var content = address1+' '+address2+' '+address3+'/ ';
                        for(key in di_con_res) {
                          content = content + di_con_res[key]['place_name'] + ' ';
                        }
                        send_fcm(is_android,
                        con_res[0]._id+'/ '+'접수완료'+'/ '+con_res[0].request_time,
                        content,
                        admin_token);
                        json = results_json(json, '1');
                        res.status(200).json(json);
                      }

                  });

                }
              });

            }
          });

        }
      });

    }
  });

}

/*
params : user_token, page
주문시각 주문자 핸드폰 번호 교내외 여부	주소1	주소2	주소3	결제방법	특이사항	배달상태	라이더 이미지
request_time  orderer_name contact	is_school	address1	address2	address3	payment	note	status	deliverer_img
items{delivery_id, place_id, menu, note}
*/
exports.delivery_info = function(req, res, next) {

  var delivery_id = req.params.id;
  var user_token = req.query.user_token;

  var sql =
  'SELECT de._id, de.orderer_name, date_format(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, '
  + 'de.contact, de.is_school, de.address1, de.address2, de.address3, de.payment, de.note, de.status, dr.img AS deliverer_img '
  + 'FROM Delivery AS de '
  + 'LEFT OUTER JOIN Deliverer AS dr '
  + 'ON de.deliverer_id = dr._id '
  + 'WHERE de._id = ? and de.user_id = ? '

  conn.query(sql, [delivery_id, user_token], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('delivery_info select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {

      console.log(results[0]);
      results[0]['items'] = [];

      var sql =
      'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
      + 'FROM DeliveryItem AS di '
      + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '
      + 'WHERE '

      var where_id = 'di.delivery_id = '+results[0]['_id'];

      conn.query(sql + where_id, function(items_err, items_res, items_fields) {
        if(items_err) {
          console.log('delivery_info items select err : '+items_err);
          json = results_json(json, '0', items_err);
          res.status(200).json(json);
        } else {
          console.log(items_res);
          for (key in items_res) {
            results[0]['items'].push(items_res[key]);
          }
          if(items_res.length == 0) {
            results[0]['items'] = '';
          }
          json = results[0];
          json = results_json(json, '1');
          res.status(200).json(json);
        }
      });

    }
  });

}

// not complete deliveryitem 추가해야 함
/*
params : delivery_id user_token
orderer_name contact	is_school	address1	address2	address3	payment	note status
items{delivery_id, place_id, menu, note}
*/
exports.delivery_modify = function(req, res, next) {

  var admin_token = 'dlLo5zHF7RI:APA91bHM2t4MoTogodFl6c_ubSbUqBCu0XrOZalQv4qXcVdjHpICAyzMh805S2YiS4-I3g7wfn85wAkzEo3VnH_GZh2sMiUeoApvAlvcP8Ii5ooAZ1KEc4mb2ssCRggBu-nMxsG0KHG6';

  var delivery_id = req.params.id;
  var user_token = req.body.user_token;
  var is_android = req.body.is_android;

  var items = req.body.items;
  var json_items = JSON.parse(items);

  var _orderer_name = req.body.orderer_name;
  var _contact = req.body.contact;
  var _is_school = req.body.is_school;
  var _address1 = req.body.address1;
  var _address2 = req.body.address2;
  var _address3 = req.body.address3;
  var _payment = req.body.payment;
  var _note = req.body.note;
  var _status = req.body.status;
  var status_string;
  switch (_status) {
    case '6':
      status_string = '배달취소'
      break;
    default:
      status_string = '주문변경'
  }

  var sql =
  'UPDATE ' + sql_FROM_Delivery
  + 'SET ? '
  + 'WHERE _id = ? and user_id = ?'

  conn.query(sql, [{
    orderer_name: _orderer_name,
    contact: _contact,
    is_school: _is_school,
    address1: _address1,
    address2: _address2,
    address3: _address3,
    payment: _payment,
    note: _note,
    status: _status} , delivery_id, user_token],
    function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('delivery_modify update err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {

      // items를 모두 delete 후 다시 insert
      conn.query('DELETE FROM DeliveryItem WHERE delivery_id = '+delivery_id,
      function(items_del_err, items_del_res, items_del_fields){
        if(items_del_err) {
          console.log('delivery_modify items delete err : '+items_del_err);
          json = results_json(json, '0', items_del_err);
          res.status(200).json(json);
        } else {

          var sql =
          'INSERT INTO ' +sql_FROM_DeliveryItem
          + '(delivery_id, place_id, menu, note) '
          + 'VALUES '

          var values = [];

          for (key in json_items) {
            values.push('('+delivery_id+', '+json_items[key]['place_id']+', \"'+
            json_items[key]['menu']+'\", \"'+json_items[key]['note']+'\")');
          }
          conn.query(sql+values, function(items_insert_err, items_insert_res, items_insert_fields){
            if(items_insert_err) {
              console.log('delivery_request items_insert err : '+items_insert_err);
              json = results_json(json, '0', items_insert_err);
              res.status(200).json(json);
            } else {

              conn.query(
                'SELECT de._id, date_format(de.request_time, \'%Y-%m-%d %H:%i:%s\') AS request_time, de.address1, de.address2, de.address3 FROM '+sql_FROM_Delivery+'AS de WHERE _id = ?'
                , [delivery_id], function(con_err, con_res, con_fie){
                if(con_err) {
                  console.log('delivery_request confirm err : '+con_err);
                  json = results_json(json, '0', con_err);
                  res.status(200).json(json);
                } else {

                  conn.query(
                    'SELECT di.delivery_id, pl.name AS place_name, di.place_id, di.menu, di.note '
                    + 'FROM DeliveryItem AS di '
                    + 'LEFT JOIN Place AS pl ON pl._id  = di.place_id '
                    + 'WHERE delivery_id = '+con_res[0]._id,
                    function(di_con_err, di_con_res, di_con_fie) {
                      if(di_con_err) {
                        console.log('delivery_request items confirm err : '+di_con_err);
                        json = results_json(json, '0', di_con_err);
                        res.status(200).json(json);
                      } else {
                        console.log(di_con_res);
                        var content = _address1+' '+_address2+' '+_address3+'/ ';
                        for(key in di_con_res) {
                          content = content + di_con_res[key]['place_name'] + ' ';
                        }
                        send_fcm(is_android,
                        con_res[0]._id+'/ '+status_string+'/ '+con_res[0].request_time,
                        content,
                        admin_token);
                        json = results_json(json, '1');
                        res.status(200).json(json);
                      }
                  });

                }
              });

            }
          });

        }
      });

    }
  });

}

/*
params: sort	page	random_key
data(array): menu_tag	menu_tag_img
*/

exports.store_menu_tag_list = function(req, res, next) {

  var sort = req.query.sort;
  var random_key = req.query.random_key;
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT mt.menu_tag, CONCAT(\''+base_s3_asset+'menu-tag/\', mt.menu_tag_img) AS menu_tag_img, '
  + '(SELECT count(*) FROM HistoryMenuTag AS hm WHERE hm.menu_tag = mt.menu_tag and DATE_FORMAT(hm.date, \'%Y-%m-%d\') between DATE_FORMAT(now()-INTERVAL 2 DAY, \'%Y-%m-%d\') and DATE_FORMAT(now(), \'%Y-%m-%d\')) AS click_num '
  + 'FROM MenuTag AS mt '

  switch (sort) {
    case 'name':
      sql = sql + 'ORDER BY menu_tag ASC ';
      break;
    case 'popular':
      sql = sql + 'ORDER BY click_num DESC ';
      break;
    case 'random':
      sql = sql + 'ORDER BY rand('+random_key+') ';
      break;
    default:

  }
  sql = sql + 'LIMIT ?, ?';

  conn.query(sql, [parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('store_menu_tag_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

/*
상점아이디	상점 이름	평균 별점	후기수	찜 수	상점 이미지	새로운 상점	이벤트 중
store_id	store_name	star_average	review_num	dibs_num	store_img	is_new	is_event
StoreKeyword 테이블에서 검색 후 나온 상점들의 가나다순 정렬
*/
exports.store_search_keyword_name = function(req, res, next) {
  var keyword = req.query.keyword;
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT distinct(st._id) AS store_id, st.name AS store_name, '
  + '(SELECT avg(star_rate) FROM Review AS re WHERE st._id = re.store_id) AS star_average, '
  + '(SELECT count(*) FROM Review AS re WHERE st._id = re.store_id) AS review_num, '
  + '(SELECT count(*) FROM UserDibs AS ud WHERE st._id = ud.store_id) AS dibs_num, '
  + 'img AS store_img, st.is_new, ev.is_open AS is_event '
  + 'FROM Store AS st '
  + 'INNER JOIN StoreKeyword AS sk ON sk.store_id = st._id AND sk.keyword like ? '
  + 'LEFT JOIN Event AS ev ON ev.store_id = st._id '
  + 'ORDER BY store_name ASC '
  + 'LIMIT ?, ?'

  conn.query(sql, ['%'+keyword+'%', parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('store_search_keyword_name select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });

}

//not complete - popular 조회수 최근 2일간 클릭이 많은 상점
/*
상점아이디	상점 이름	평균 별점	후기수	찜 수	상점 이미지	새로운 상점	이벤트 중
store_id	store_name	star_average	review_num	dibs_num	store_img	is_new	is_event
StoreKeyword 테이블에서 검색 후 나온 상점들의 최근 2일간 조회수가 높은 순 정렬
*/
exports.store_search_keyword_popular = function(req, res, next) {
  var keyword = req.query.keyword;
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT distinct(st._id) AS store_id, st.name AS store_name, '
  + '(SELECT avg(star_rate) FROM Review AS re WHERE st._id = re.store_id) AS star_average, '
  + '(SELECT count(*) FROM Review AS re WHERE st._id = re.store_id) AS review_num, '
  + '(SELECT count(*) FROM UserDibs AS ud WHERE st._id = ud.store_id) AS dibs_num, '
  + 'img AS store_img, st.is_new, ev.is_open AS is_event, '
  + '(SELECT count(*) FROM HistoryStore AS hs WHERE hs.store_id = st._id and DATE_FORMAT(hs.date, \'%Y-%m-%d\') between DATE_FORMAT(now()-INTERVAL 2 DAY, \'%Y-%m-%d\') and DATE_FORMAT(now(), \'%Y-%m-%d\')) AS click_num '
  + 'FROM Store AS st '
  + 'INNER JOIN StoreKeyword AS sk ON sk.store_id = st._id AND sk.keyword like ? '
  + 'LEFT JOIN Event AS ev ON ev.store_id = st._id '
  + 'ORDER BY click_num DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, ['%'+keyword+'%', parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('store_search_keyword_name select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

/*
상점아이디	상점 이름	평균 별점	후기수	찜 수	상점 이미지	새로운 상점	이벤트 중
store_id	store_name	star_average	review_num	dibs_num	store_img	is_new	is_event
StoreKeyword 테이블에서 검색 후 나온 상점들의 랜덤 정렬
*/
exports.store_search_keyword_random = function(req, res, next) {
  var keyword = req.query.keyword;
  var random_key = req.query.random_key;
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT distinct(st._id) AS store_id, st.name AS store_name, '
  + '(SELECT avg(star_rate) FROM Review AS re WHERE st._id = re.store_id) AS star_average, '
  + '(SELECT count(*) FROM Review AS re WHERE st._id = re.store_id) AS review_num, '
  + '(SELECT count(*) FROM UserDibs AS ud WHERE st._id = ud.store_id) AS dibs_num, '
  + 'img AS store_img, st.is_new, ev.is_open AS is_event '
  + 'FROM Store AS st '
  + 'INNER JOIN StoreKeyword AS sk ON sk.store_id = st._id AND sk.keyword like ? '
  + 'LEFT JOIN Event AS ev ON ev.store_id = st._id '
  + 'ORDER BY rand(?) '
  + 'LIMIT ?, ?'

  conn.query(sql, ['%'+keyword+'%', random_key, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('store_search_keyword_name select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

//not complete
exports.store_review_image_upload = function(req, res, next) {
    var json = {'hello': 'world'}

    res.status(200).json(json);
}

exports.writer_article_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var id = req.params.id;
  var sql =
  'SELECT ar._id AS article_id, ar.img, ar.title, count(al._id) as like_num, count(ac._id) as comment_num, date_format(ar.date, \'%Y-%m-%d %H:%i:%s\') AS date '
  + 'FROM ' + sql_FROM_Article + 'AS ar '
  + 'LEFT OUTER JOIN ArticleLike AS al ON ar._id = al.article_id '
  + 'LEFT OUTER JOIN ArticleComment AS ac ON ar._id = ac.article_id '
  + 'WHERE ar.writer_id = ?'
  + 'GROUP BY ar._id '
  + 'HAVING count(ar._id) '
  + 'ORDER BY ar.priority DESC, ar._id DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [id, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_article_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

exports.writer_info = function(req, res, next) {
  var id = req.params.id;
  var sql =
  'SELECT _id AS writer_id, profile_main, user_id, profile_img, name, detail, like_total '
  + 'FROM ' + sql_FROM_ArticleWriter + 'AS aw '
  + 'JOIN (SELECT ar.writer_id, count(*) as like_total '
  	     + 'FROM Article AS ar '
  	     + 'JOIN ArticleLike AS al ON ar._id = al.article_id '
  	     + 'GROUP BY ar.writer_id '
  	     + 'HAVING count(writer_id)) AS at '
  + 'ON at.writer_id = aw._id '
  + 'WHERE aw._id = ?';

  conn.query(sql, [id], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results[0];
      json = results_json(json, '1');
      res.status(200).json(json);
    }
  });
}

exports.writer_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT _id AS writer_id, profile_main, user_id, profile_img, name, detail, like_total '
  + 'FROM ' + sql_FROM_ArticleWriter + 'AS aw '
  + 'JOIN (SELECT ar.writer_id, count(*) as like_total '
  	     + 'FROM Article AS ar '
  	     + 'JOIN ArticleLike AS al ON ar._id = al.article_id '
  	     + 'GROUP BY ar.writer_id '
  	     + 'HAVING count(writer_id)) AS at '
  + 'ON at.writer_id = aw._id '
  + 'ORDER BY priority DESC, _id DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });

};

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
        console.log('send_fcm err : '+err);
        json = results_json(json, '0', err);
        res.status(200).json(json);
      } else {
        return response;
      }
  });
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
