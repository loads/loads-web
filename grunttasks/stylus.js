'use strict';

var conf = require('../server/config');
var compressCss = conf.getCompressCss;

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-stylus');

  grunt.config('stylus', {
    options: {
      compress: compressCss
    },
    app: {
      files: {
        'client/static/assets/css/app.css': 'client/static/assets/stylus/app.styl'
      }
    }
  });
};
