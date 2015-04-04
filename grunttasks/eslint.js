'use strict';

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-eslint');

  grunt.config('eslint', {
    app: {
      src: [
        '{,client/**/,server/**/,grunttasks/}*.js',
        '!client/bower_components/**'
      ]
    }
  });
};
