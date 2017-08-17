var schedule = require('node-schedule');
console.log('Scheduler start');

module.exports = function(app, conn) {

  // var sql_FROM_Truck = 'ArticleTest ';
  var sql_FROM_Truck = 'Truck ';
  var rule = new schedule.RecurrenceRule();

  rule.hour = 22;
  rule.minute = 0;
  rule.second = 0;

  schedule.scheduleJob(rule, function(){
    console.log('Everyday UTC 22 set Truck status 2');
    var sql =
    'UPDATE '+sql_FROM_Truck
    + 'SET status = ? '

    conn.query(sql, ['2'], function(err, res, fie){
      if(err) {
        console.log('Set Truck Status Error : ' + err);
      } else {
        console.log('Set Truck Status : 2');
      }
    });
  });

}
