/*
Article

GET : '/' List Article
GET : '/ID' Select ID Article View
POST : '/' Write Article
PUT : '/ID' Update Article
DELETE : '/ID' Delete Article

*/
module.exports = function(app, conn, router) {
  var express = require('express');
  var router = express.Router();
  var multer = require('multer');
  var upload = multer({ dest: 'uploads/' });
  var fs = require('fs');
  var AWS = require('aws-sdk');
  AWS.config.update({
    accessKeyId: "AKIAI5I5WQRQ7RG4JH4A",
    secretAccessKey: "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",
    region: "ap-northeast-2"
  });
  var s3 = new AWS.S3();
  var gm = require('gm');
  var sql_FROM_Article = 'ArticleTest';
  var sql_INSERT_defaultUrl = 'https://s3.ap-northeast-2.amazonaws.com/kusulang-test/';
  var s3_bucket = 'kusulang-test';

  var methodOverride = require('method-override');
  router.use(methodOverride('_method'));
  router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
  }));

  var write = require('./write')(app, conn);
  var error = require('./error')(app, conn);

  router.use('/write', write);
  router.use('/error', error);

  // var modify = require('./modify')(app, conn);
  // router.use('/:id/modify', modify);

  // Article List
  router.get('/', function (req, res, next) { // index page
    var sql =
    'SELECT '+sql_FROM_Article+'.*, ArticleWriter.name '+
    'FROM '+sql_FROM_Article+' '+
    'INNER JOIN ArticleWriter ON ArticleWriter._id = '+sql_FROM_Article+'.writer_id';
    conn.query(sql, function(err, results, fields){
      if(err) console.log('list : '+err);
      res.render('article/list.pug', {results: results, path: req.originalUrl});
    });
  });

  // Article Write
  router.post('/', upload.fields([
    {name: 'main_img', maxCount: 1},
    {name: 'content_htm', maxCount: 1},
    {name: 'content_files'}]), function(req, res, next) {

      try {
        var title = req.body.title;
        var writer_id = req.body.writer_id;
        var main_img;
        var content_htm;
        var content_files;
        var main_img_uploadname;
        var content_htm_uploadname;
        var content_htm_name;

        if(!title.trim() ||
          req.files.content_files === undefined ||
          req.files.content_htm === undefined ||
          req.files.main_img === undefined) {
          res.redirect('./article/error/101');
        } else {
          main_img = req.files.main_img[0];
          content_htm = req.files.content_htm[0];
          content_files = req.files.content_files;

          have_same_things(title, main_img, content_htm, content_files, function(){

            main_img_uploadname = file_upload(main_img, null, function(){
              content_htm_uploadname = file_upload(content_htm, null, function(){
                content_htm_name = content_htm.originalname.split('.htm')[0];
                for (var i = 0; i < content_files.length; i++) {
                  var complete_num = 0;
                  file_upload(content_files[i], content_htm_name+'.files/', function(){
                    complete_num++;
                    if(complete_num == i) {
                      var sql =
                      'INSERT INTO '+sql_FROM_Article+' (writer_id, title, img, url, date)'+
                      'VALUES (?, ?, ?, ?, now())';
                      conn.query(sql, [writer_id, title,
                        sql_INSERT_defaultUrl+main_img_uploadname, sql_INSERT_defaultUrl+content_htm_uploadname],
                        function(insert_err, insert_res, insert_fie){
                        if(insert_err) console.log('insert error : '+insert_err);
                        console.log(insert_res.insertId);
                        console.log('complete insert - title : '+title);
                        res.redirect('./article/'+insert_res.insertId+'/');
                      });
                    }
                  });
                }
              });
            });

          });

        }
      } catch (exception) {
        console.log('write err : ',exception);
        res.redirect('./article/error/');
      }
  });

  // Article View
  router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var sql = 'SELECT _id FROM '+sql_FROM_Article;

    conn.query(sql, function(err, ids, fields){
      if(err) console.log(err);
      for (var i = 0; i < ids.length; i++) {
        if(ids[i]._id == id) {
          var sql =
          'SELECT '+sql_FROM_Article+'.*, ArticleWriter.name '+
          'FROM '+sql_FROM_Article+' '+
          'INNER JOIN ArticleWriter ON ArticleWriter._id = '+sql_FROM_Article+'.writer_id '+
          'WHERE '+sql_FROM_Article+'._id = ?';
          conn.query(sql, [id], function(err, results, fields){
            if(err) {
              res.send(err);
              console.log(err);
            }
            console.log(results);
            res.render('article/view.pug', {results: results});
          });
          break;
        }
      }
    });
  });

  // Article Modify
  router.put('/:id', upload.fields([
    {name: 'main_img', maxCount: 1},
    {name: 'content_htm', maxCount: 1},
    {name: 'content_files'}]), function (req, res, next) {

      var title = req.body.title;
      var writer_id = req.body.writer_id;
      var main_img;
      var content_htm;
      var content_files;
      var main_img_uploadname;
      var content_htm_uploadname;
      var content_htm_name;

      var sel_result_id = req.body.sel_result_id;

      console.log('sel_result_id : '+sel_result_id);
      console.log(req.body.title);
      console.log(req.body.writer_id);
      console.log(req.files.content_files);
      console.log(req.files.content_htm);
      console.log(req.files.main_img);

      try {
        if(!title.trim()) {
          res.redirect('./article/error/101');
        } else {

          var sql = 'SELECT * FROM '+sql_FROM_Article+' WHERE _id = ?';
          conn.query(sql, [sel_result_id], function(sel_err, sel_res, sel_fie){
            console.log('sel_res', sel_res);

            if(req.files.main_img !== undefined) main_img = req.files.main_img[0];
            main_img_uploadname = file_upload(main_img, null, function(){

              if(req.files.content_htm !== undefined) content_htm = req.files.content_htm[0];
              content_htm_uploadname = file_upload(content_htm, null, function(){

                if(req.files.content_files !== undefined) {

                  content_files = req.files.content_files;
                  content_htm_name = content_htm.originalname.split('.htm')[0];

                  for (var i = 0; i < content_files.length; i++) {
                    var complete_num = 0;
                    file_upload(content_files[i], content_htm_name+'.files/', function(){
                      complete_num++;
                      if(complete_num == i) {

                        if(main_img_uploadname === undefined) {
                          main_img_uploadname = sel_res[0].img;
                        } else {
                          main_img_uploadname = sql_INSERT_defaultUrl+main_img_uploadname;
                        }

                        if(content_htm_uploadname === undefined) {
                          content_htm_uploadname = sel_res[0].url;
                        } else {
                          content_htm_uploadname = sql_INSERT_defaultUrl+content_htm_uploadname;
                        }

                        update_sql(writer_id, title,
                          main_img_uploadname, content_htm_uploadname, sel_res[0]._id);
                        // var sql =
                        // 'UPDATE '+sql_FROM_Article+' '+
                        // 'SET writer_id = ?, title = ?, img = ?, url = ? '+
                        // 'WHERE _id = ?';
                        // conn.query(sql, [writer_id, title,
                        //   main_img_uploadname, content_htm_uploadname, sel_res[0]._id],
                        //   function(up_err, up_res, up_fie){
                        //   if(up_err) console.log('update error : '+up_err);
                        //   // console.log(up_res.insertId);
                        //   console.log('complete update - title : '+title);
                        //   res.redirect('./'+sel_res[0]._id+'/');
                        // });

                      }
                    });
                  }

                } else {

                  if(main_img_uploadname === undefined) {
                    main_img_uploadname = sel_res[0].img;
                  } else {
                    main_img_uploadname = sql_INSERT_defaultUrl+main_img_uploadname;
                  }

                  if(content_htm_uploadname === undefined) {
                    content_htm_uploadname = sel_res[0].url;
                  } else {
                    content_htm_uploadname = sql_INSERT_defaultUrl+content_htm_uploadname;
                  }

                  update_sql(writer_id, title,
                    main_img_uploadname, content_htm_uploadname, sel_res[0]._id);
                  // var sql =
                  // 'UPDATE '+sql_FROM_Article+' '+
                  // 'SET writer_id = ?, title = ?, img = ?, url = ? '+
                  // 'WHERE _id = ?';
                  // conn.query(sql, [writer_id, title,
                  //   main_img_uploadname, content_htm_uploadname, sel_res[0]._id],
                  //   function(up_err, up_res, up_fie){
                  //     if(up_err) console.log('update error : '+up_err);
                  //     // console.log(up_res);
                  //     console.log('complete update - title : '+title);
                  //     res.redirect('./'+sel_res[0]._id+'/');
                  // });

                }

              });

            });

          });

        }
      } catch (exception) {
        console.log('modify err : ',exception);
        res.redirect('./article/error/');
      }

      function update_sql(writer_id, title, img, url, _id) {

        var sql =
        'UPDATE '+sql_FROM_Article+' '+
        'SET writer_id = ?, title = ?, img = ?, url = ? '+
        'WHERE _id = ?';
        conn.query(sql, [writer_id, title, img, url, _id],
          function(up_err, up_res, up_fie){
            if(up_err) console.log('update error : '+up_err);
            // console.log(up_res);
            console.log('complete update - title : '+title);
            res.redirect('./'+_id+'/');
        });

      }
      // res.send('put');
  });

  // Article Route Modify Page
  router.get('/:id/modify', function(req, res, next){
    var id = req.params.id;
    var sql = 'SELECT * FROM '+sql_FROM_Article+' WHERE _id = ?'
    conn.query(sql, [id], function(err, sel_results, fields){
      if(err) console.log(err);
      var sql = 'SELECT * FROM ArticleWriter WHERE _id = ?';
      conn.query(sql, [sel_results[0].writer_id],function(err, sel_writers, fields){
        if(err) console.log(err);
        var sql = 'SELECT * FROM ArticleWriter';
        conn.query(sql, function(err, writers, fields){
          if(err) console.log(err);
          res.render('article/input_form.pug', {sel_results: sel_results, sel_writers: sel_writers, writers: writers})
        });
      });
      // res.render('article/input_form.pug', {results: results});
    });
  });

  // Article Delete
  router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    var sql = 'DELETE FROM '+sql_FROM_Article+' WHERE _id = ?';
    conn.query(sql, [id], function(del_err, del_res, del_fileds){
      if(del_err) console.log('del err : '+del_err);
      if(del_res.affectedRows == '1') {
        res.redirect('../');
      } else if(del_res.affectedRows == '0') {
        res.redirect('../error/102/');
      }
    });
  });

  // Article Route Delete Page
  router.get('/:id/delete', function (req, res, next) {
    var id = req.params.id;
    var sql = 'SELECT _id, title FROM '+sql_FROM_Article+' WHERE _id = ?';
    conn.query(sql, [id], function(sel_err, sel_res, sel_fileds){
      if(sel_err) console.log(sel_err);
      res.render('article/delete.pug', {results: sel_res});
    });
    // res.render('article/delete.pug', {id: id, title: title});
  });

  //Function Have Same things?
  function have_same_things(title, main_img, content_htm, content_files, callback) {
    var sql =
    'SELECT count(_id) AS num FROM '+sql_FROM_Article+' '+
    'WHERE title LIKE ? OR img LIKE ? OR url LIKE ?';
    conn.query(sql,
      ['%'+title+'%', '%'+main_img.originalname+'%', '%'+content_htm.originalname+'%'],
      function(err, results, fields){
      var num = results[0].num;
      if(err || num != 0) {

         console.log('same things num : '+num);
         console.log('same things error : '+err);
         fs.unlink(file_path(main_img), function(err) {
           if(err) console.log('unlink : '+err);
           fs.unlink(file_path(content_htm), function(err) {
             if(err) console.log('unlink : '+err);
             for (var i = 0; i < content_files.length; i++) {
               fs.unlink(file_path(content_files[i]), function(err) {
                 if(err) console.log('unlink : '+err);
               });
             }
           });
         });
         res.redirect('./article/error/100');

      } else {
        callback();
      }
    });
  }

  //Function path
  function file_path(file) {
    return file.destination+file.filename;
  }

  //Function Flie Converter
  function file_convert(file, plus_Dir, callback) {
    // console.log(file);
    var filename = file.filename;
    var destination = file.destination;
    var originalname = file.originalname;
    var uploadname = file.originalname;
    if(plus_Dir != null) {
      uploadname = plus_Dir+originalname;
    }
    var path = destination+filename;
    callback(path, originalname, uploadname);

    return uploadname;
  }

  // Function File Upload
  function file_upload(file, plus_Dir, callback) {
    var content_type;
    var uploadname;
    if(file !== undefined) {
      content_type = file.mimetype;
      uploadname = file_convert(file, plus_Dir, function(path, originalname, uploadname){
        if(file.mimetype.split('/')[0] == 'image') {
          fs.rename(path, path+'.'+originalname.split('.')[1], function(err) {
            var patthplusext = path+'.'+originalname.split('.')[1];
            if(err) console.log('rename err : '+err);
            gm(patthplusext)
              .quality(50)
              .write(patthplusext, function(err) {
                if(err) console.log(err);
                s3_file_upload(patthplusext, uploadname, content_type, function(){
                  callback();
                });
            });
          });
        } else {
          s3_file_upload(path, uploadname, content_type, function(){
            callback();
          });
        };
      });
    } else {
      callback();
    }
    console.log('uploadname : '+uploadname);
    return uploadname;
  }

  // Function S3 File upload
  function s3_file_upload(path, uploadname, content_type, callback) {
    console.log(uploadname+' : '+content_type);
    var param = {
        'Bucket': s3_bucket,
        'Key': uploadname,
        'ACL': 'public-read',
        'Body': fs.createReadStream(path),
        'ContentType': content_type
    };
    s3.upload(param, function(err, data) {
      if(err) console.log('s3 upload err : '+err);
      fs.unlink(path, function(err) {
        if(err) console.log('unlink : '+err);
        callback();
      });
      console.log('s3 upload complete : '+path+' -> '+uploadname);
    });
  }

  return router;
};
