/*
Article Modify
*/
module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();

  router.get('./:id/modify', function(req, res, next){
    var id = req.params.id;
    var sql = 'SELECT name FROM ArticleWriter';
    conn.query(sql, function(err, writers, fields){
      if(err) console.log(err);
      res.send(id);
      // res.render('article/input_form.pug', {writers: writers});
    });
  });

  return router;
};
