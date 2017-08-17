var schedule = require('node-schedule');
var nconf = require('nconf');
nconf.argv().env();
nconf.file(process.cwd()+'/config/config.json');

exports.delivery_start_schedule = function(hour) {

  console.log('delivery start schedule start '+ hour);

  var rule = new schedule.RecurrenceRule();

  rule.hour = hour;
  rule.minute = 0;
  rule.second = 0;

  var delivery_schedule = schedule.scheduleJob(rule, function(){
    console.log('start delivery');
    nconf.file(process.cwd()+'/config/config.json');
    nconf.set('delivery:available', 1);
    nconf.save();
  })

  return delivery_schedule;
}

exports.delivery_end_schedule = function(hour) {

  console.log('delivery end schedule start ' + hour);

  var rule = new schedule.RecurrenceRule();

  rule.hour = hour;
  rule.minute = 0;
  rule.second = 0;

  var delivery_schedule = schedule.scheduleJob(rule, function(){
    console.log('end delivery');
    nconf.file(process.cwd()+'/config/config.json');
    nconf.set('delivery:available', 0);
    nconf.save();
  })

  return delivery_schedule;
}
