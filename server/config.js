'use strict';

var fs = require('fs');
var path = require('path');

var awstypes = require('awstypes');
var convict = require('convict');

var DAYS_IN_MS = 1000 * 60 * 60 * 24;

var conf = convict({
  env: {
    doc: 'Application environment',
    format: ['local', 'awsdev', 'prod', 'test'],
    default: 'local',
    env: 'NODE_ENV'
  },

  aws: {
    instanceTypes: {
      doc: 'An array of AWS EC2 instance types.',
      format: Array,
      default: awstypes.getTypes(['t2.', 'm3.', 'c4.', 'c3.'])
    },
    regions: {
      doc: 'An object of AWS regions.',
      format: Object,
      default: awstypes.getRegions()
    }
  },

  server: {
    auth: {
      strategy: {
        cookie: {
          doc: 'Name of session cookie.',
          default: 'sid',
          format: String,
          env: 'AUTH_COOKIE'
        },
        isSecure: {
          doc: 'Secure session',
          default: false,
          format: Boolean,
          env: 'AUTH_IS_SECURE'
        },
        password: {
          doc: 'Session secret password',
          default: 'sekret',
          format: String,
          env: 'AUTH_PASSWORD'
        },
        redirectTo: {
          doc: 'URL to redirect to',
          default: '/login',
          format: String,
          env: 'AUTH_REDIRECT_TO'
        }
      }
    },

    cache: {
      expiresIn: {
        doc: 'Session duration in milliseconds.',
        format: 'int',
        default: 7 * DAYS_IN_MS,
        env: 'CACHE_EXPIRES_IN'
      }
    },

    connection: {
      host: {
        doc: 'Host to run the Hapi server on',
        format: String,
        default: '0.0.0.0',
        env: 'HOST'
      },
      port: {
        doc: 'Port to run the Hapi server on',
        format: 'port',
        default: 5000,
        env: 'PORT'
      }
    },

    db: {
      connection: {
        doc: 'MySQL connection string',
        format: String,
        default: ''
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
