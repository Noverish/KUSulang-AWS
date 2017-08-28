/*
Mysql Connection Infomation
*/
module.exports = function(){

  var mysql = require('mysql');

  var db_config = {
    host     : 'kusulang.clqnfykyz4cm.ap-northeast-2.rds.amazonaws.com',
    user     : 'ziumofficial',
    password : 'zntbffod1!',
    database : 'dbziumofficial'
  };

  var conn;

  var pool = mysql.createPool({
    connecttionLimit : 10,
    host     : 'kusulang.clqnfykyz4cm.ap-northeast-2.rds.amazonaws.com',
    user     : 'ziumofficial',
    password : 'zntbffod1!',
    database : 'dbziumofficial'
  });

  // function handleDisconnect() {
  //     conn = mysql.createConnection(db_config);
  //
  //     conn.connect(function(err) {
  //       if(err) {
  //         console.log('error when connecting to DB', err);
  //         setTimeout(handleDisconnect(), 2000);
  //       }
  //     });
  //
  //     conn.on('error', function(err){
  //       console.log('DB error', err);
  //       if(err.code === 'PROTOCOL_CONNECTION_LOST') {
  //         handleDisconnect();
  //       } else {
  //         throw err;
  //       }
  //     });
  // }
  //
  // handleDisconnect();

  return pool;
}
