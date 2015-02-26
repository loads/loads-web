'use strict';

var Sequelize = require('sequelize');

var CONNECTION_STRING = 'mysql://bf7b93b4271c8b:b86e5248@us-cdbr-iron-east-01.cleardb.net/heroku_9f656c64b3de37f?reconnect=true';

var sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: 'mysql',
  logging: false,
  pool: {
    maxConnections: 10,
    maxIdleTime: 30
  }
});

exports.Comment = sequelize.define('Comment', {
  runId: Sequelize.STRING,
  name: Sequelize.STRING,
  comment: Sequelize.TEXT
});

// Sync the models to the server and recreate tables.
sequelize.sync({
  force: false
}).complete(function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
