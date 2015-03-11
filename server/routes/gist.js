'use strict';

module.exports = [{
  method: 'GET',
  path: '/api/gist/{id}',
  handler: function(request, reply) {
	var id = request.params.id ||  '88695561d9fe3acd71b9'; // Hardcoding for the sake of ease;
	var output = {};

	require('octonode').client().gist().get(id, function(err, data) {
		if(err) {
			output = err;
			output.success = false;
		}
		else {
			output.owner = data.owner.login;
			output.owner_avatar_url = data.owner.avatar_url;
			output.success = true;

			['description', 'comments', 'created_at', 'update_at', 'id', 'public'].forEach(function(i) {
				output[i] = data[i];
			});-

			output.files = extractGistFiles(data.files);
		}
		
		reply(JSON.stringify(output, null, 2));
	});	
  },
  config: {
    description: 'API to get gists from github and return the data',
    notes: 'This is a clever note',
    tags: ['api', 'gist']
  }
}];


/**
 * Converts the GitHub Gist's object of files into an Array.
 *
 * @param  {Object} filesObj [description]
 * @return {Array}           [description]
 */
function extractGistFiles(filesObj) {
  // Convert from an Object hash of files into an array and convert JSON files to Objects.
  return Object.keys(filesObj).map(function (key) {
    var file = filesObj[key];
    // If the current file is a .JSON file, convert it from a string to an object.
    if (file.type === 'application/json') {
      file.content = JSON.parse(file.content);
    }
    return file;
  });
}