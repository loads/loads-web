'use strict';

var fs = require('fs');
var path = require('path');

var convict = require('convict');

var DAYS_IN_MS = 1000 * 60 * 60 * 24;

var conf = convict({
  env: {
    doc: 'Application environment',
    format: ['local', 'awsdev', 'prod', 'test'],
    default: 'local',
    env: 'NODE_ENV'
  },
  host: {
    doc: 'Host to run the Hapi server on',
    format: String,
    default: '0.0.0.0'
  },
  port: {
    doc: 'Port to run the Hapi server on',
    format: 'port',
    default: 5000,
    env: 'PORT'
  },
  server: {
    session: {
      duration: {
        doc: 'Session duration in milliseconds.',
        format: 'int',
        default: 7 * DAYS_IN_MS,
        env: 'SESSION_DURATION'
      },
      cookieName: {
        doc: 'Name of session cookie.',
        default: 'sid',
        format: String,
        env: 'SESSION_COOKIE_NAME'
      },
      secret: {
        doc: 'Session secret password',
        default: 'sekret',
        format: String,
        env: 'SESSION_SECRET'
      },
      secure: {
        doc: 'Secure session',
        default: false,
        format: Boolean,
        env: 'SESSION_SECURE'
      }
    }
  }
});

var env = conf.get('env');
var envConfig = path.join(__dirname, '..', 'config', env + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES).split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate();

module.exports = conf;
