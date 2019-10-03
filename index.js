
/**
 * Module dependencies.
 */

var repo = process.argv[2] || 'segmentio/analytics.js';
var output = process.argv[3] || 'output.csv';
var github = require('./lib/github');
var co = require('co');
var fs = require('fs');

/**
 * Do stuff.
 */

co(function *(){
  console.log('Fetching stargazers for repo: '+repo);
  var stargazers = yield github.getStargazers(repo);
  console.log('Fetching user profiles for '+stargazers.length+' stargazers');
  for (var i = 0; i < stargazers.length; i++) {
    try {
      var user = yield github.getEmail(stargazers[i]);
      var line = [user.username, user.name, user.location, user.email, user.hireable].join(',') + '\n';
      fs.appendFileSync(output, line, { encoding: 'utf8' });
    } catch (e) {
      console.error(e);
    }
  }
  console.log('Done writing stargazer profiles to '+output);
});
