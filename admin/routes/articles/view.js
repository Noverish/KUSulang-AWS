/*
Ariticle view
*/
module.exports = function(){
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res, next){
    res.send('view', id);
  });

  return router;
};
