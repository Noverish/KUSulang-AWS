module.exports = function(app) {
  var express = require('express');
  var router = express.Router();

  router.get('/', function (req, res, next) { // index page
    console.log('article', 'index');
    res.send('article index');
  });

  return router;
};
