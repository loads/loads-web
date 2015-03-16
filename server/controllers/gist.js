'use strict';

var github = require('octonode');
var mask = require('json-mask');

module.exports = function(request, reply) {
  var gistid = request.params.id;
  var output = {};

  // TODO: Specify a GitHub client token or some sort of auth (based on env vars).
  // Default to anonymous (but limited number of requests) if env vars aren't
  // present.
  github.client().gist().get(gistid, function(err, data) {
    if (err) { // Basic error
      output = err;
      output.success = false;
      return reply(output);
    }

    output = mask(data, 'owner(avatar_url,login),description,comments,id,public,files,created_at,updated_at');
    output.files = extractGistFiles(output.files);
    output.success = true;

    // If the files are no good, go back to error mode
    if(!output.files.length || output.files[0].content.error) {
      output.message = 'Invalid JSON:  File could not be parsed.';
      output.success = false;
    }

    reply(output);
  });
};

/**
 * Converts the GitHub Gist's object of files into an Array.
 *
 * @param  {Object} filesObj [description]
 * @return {Array}           [description]
 */
function extractGistFiles(filesObj) {
  // Convert from an Object hash of files into an array and convert JSON files to Objects.
  return Object.keys(filesObj).map(function (key) {
    return filesObj[key];
  }).filter(jsonOnly).map(parseJson);
}

function jsonOnly(file) {
  return (file.language === 'JSON');
}

function parseJson(file) {
  try {
    file.content = JSON.parse(file.content);

    // TODO: More validation here? We could just check for a root `name` and
    // `plans` properties and do a `throw` if they aren't present so the code
    // will go into the `catch () {}` path.
  } catch (err) {
    file.content = {
      error: 'File contents could not be parsed'
    };
  }
  return file;
}
