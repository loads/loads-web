'use strict';

module.exports = function (grunt) {

  // require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: require('./package.json')
  });

  grunt.loadTasks('grunttasks');
};
