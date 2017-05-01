/*
Ariticle Write
*/
module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res, next){
    var sql = 'SELECT * FROM ArticleWriter';
    conn.query(sql, function(err, writers, fields){
      if(err) console.log(err);
      res.render('articles/input_form.pug', {writers: writers});
    });
  });

  return router;
};
