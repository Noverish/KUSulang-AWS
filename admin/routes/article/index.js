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

  var write = require('./write')(app, conn);
  var error = require('./error')(app, conn);
  router.use('/write', write);
  router.use('/error', error);

  // var modify = require('./modify')(app, conn);
  // router.use('/:id/modify', modify);

  // Article List
  router.get('/', function (req, res, next) { // index page
    var sql =
    'SELECT ArticleTest.*, ArticleWriter.name '+
    'FROM ArticleTest '+
    'INNER JOIN ArticleWriter ON ArticleWriter._id = ArticleTest.writer_id';
    conn.query(sql, function(err, results, fields){
      if(err) console.log('list : '+err);
      res.render('article/list.pug', {results: results, path: req.originalUrl});
    });
  });

  // Article View
  router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var sql = 'SELECT _id FROM ArticleTest';

    conn.query(sql, function(err, ids, fields){
      if(err) console.log(err);
      for (var i = 0; i < ids.length; i++) {
        if(ids[i]._id == id) {
          var sql =
          'SELECT ArticleTest.*, ArticleWriter.name '+
          'FROM ArticleTest '+
          'INNER JOIN ArticleWriter ON ArticleWriter._id = ArticleTest.writer_id '+
          'WHERE ArticleTest._id = ?';
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

        if(req.files.content_files === undefined ||
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
                      'INSERT INTO ArticleTest (writer_id, title, img, url, date)'+
                      'VALUES (?, ?, ?, ?, now())';
                      conn.query(sql, [writer_id, title, main_img_uploadname, content_htm_uploadname], function(insert_err, insert_res, insert_fie){
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

  // Article Modify Page
  router.get('/:id/modify', function(req, res, next){
    var id = req.params.id;
    var sql = 'SELECT * FROM ArticleTest WHERE _id = ?'
    conn.query(sql, [id], function(err, results, fields){
      if(err) console.log(err);
      var sql = 'SELECT name FROM ArticleWriter';
      conn.query(sql, function(err, writers, fields){
        if(err) console.log(err);
        res.render('article/input_form.pug', {
          writers: writers,
          results: results
        });
      });
      // res.render('article/input_form.pug', {results: results});
    });
  });

  //Function Have Same things?
  function have_same_things(title, main_img, content_htm, content_files, callback) {
    var sql =
    'SELECT count(_id) AS num FROM ArticleTest '+
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
    var uploadname = file_convert(file, plus_Dir, function(path, originalname, uploadname){
      if(file.mimetype.split('/')[0] == 'image') {
        fs.rename(path, path+'.'+originalname.split('.')[1], function(err) {
          var patthplusext = path+'.'+originalname.split('.')[1];
          if(err) console.log('rename err : '+err);
          gm(patthplusext)
            .quality(30)
            .write(patthplusext, function(err) {
              if(err) console.log(err);
              s3_file_upload(patthplusext, uploadname, function(){
                callback();
              });
          });
        });
      } else {
        s3_file_upload(path, uploadname, function(){
          callback();
        });
      };
      console.log('uploadname : '+uploadname);
    });
    return uploadname;
  }

  // Function S3 File upload
  function s3_file_upload(path, uploadname, callback) {
    var param = {
        'Bucket':'kusulang-test',
        'Key': uploadname,
        'ACL':'public-read',
        'Body':fs.createReadStream(path)
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
