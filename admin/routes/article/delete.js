/*
Article Delete
*/
module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res, next){
    res.send('삭제'+req.params.id);
  });

  return router;
};
