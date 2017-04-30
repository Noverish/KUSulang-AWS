/*
Article Error Page
*/
module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();

  router.get('/:id', function(req, res, next){
    switch (req.params.id) {
      case '100':
        res.send('Exist same things');
        break;
      case '101':
        res.send('No Files');
        break;
      case '102':
        res.send('No Exist Article');
        break;
      default:
        res.send('error');
    };
  });
  router.get('/', function(req, res, next){
    res.send('error');
  });

  return router;
};
