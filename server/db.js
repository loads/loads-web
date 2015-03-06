'use strict';

var Sequelize = require('sequelize');

var conf = require('./config');

var CONNECTION_STRING = conf.get('db.connection');

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
