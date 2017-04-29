module.exports = function(app) {
  var express = require('express');
  var router = express.Router();
  var conn = require('./db')();
  var passport = require('passport');

  return router;
};
