exports.list = function(req, res, next) {
  res.render('deliveries/list.pug');
};
exports.view = function(req, res, next) {
  var id = req.params.id;
  res.render('deliveries/view.pug', {id, id});
}
