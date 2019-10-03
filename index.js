
/**
 * Module dependencies.
 */
var dotenv = require('dotenv');
dotenv.config();

var repo = process.argv[2] || 'segmentio/analytics.js';
var output = process.argv[3] || 'output.csv';
var github = require('./lib/github');
var co = require('co');
var fs = require('fs');
var ProgressBar = require('progress');

/**
 * Do stuff.
 */

co(function *(){
  console.log('Fetching stargazers for repo: '+repo);
  var stargazers = yield github.getStargazers(repo);
  console.log('Fetching user profiles for '+stargazers.length+' stargazers');

  var bar = new ProgressBar('Profiles [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 60,
    total: stargazers.length
  });

  for (var i = 0; i < stargazers.length; i++) {
    try {
      var user = yield github.getEmail(stargazers[i]);
      var line = [user.username, user.name, user.email].join(',') + '\n';
      fs.appendFileSync(output, line, { encoding: 'utf8' });
      bar.tick();
    } catch (e) {
      console.error(e);
    }
  }
  console.log('Done writing stargazer profiles to '+output);
});
