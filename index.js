
/**
 * Module dependencies.
 */
var dotenv = require('dotenv');
dotenv.config();

var repo = process.argv[2] || 'segmentio/analytics.js';
var output = process.argv[3] || 'output.csv';
var source = process.argv[4] || 'stargazers';
var github = require('./lib/github');
var co = require('co');
var fs = require('fs');
var ProgressBar = require('progress');

/**
 * Do stuff.
 */

co(function *(){
  console.log('Fetching '+source+' for repo: '+repo);
  var sourceList;
  if(source === 'stargazers') {
    sourceList = yield github.getStargazers(repo);
  } else if(source === 'forkers') {
    sourceList = yield github.getForkers(repo);
  }
  console.log('Fetching user profiles for '+sourceList.length+' '+source);

  var bar = new ProgressBar('Profiles [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 60,
    total: sourceList.length
  });

  for (var i = 0; i < sourceList.length; i++) {
    try {
      var user = yield github.getEmail(sourceList[i]);
      var line = ['"'+user.username+'"', '"'+user.name+'"', '"'+user.email+'"'].join(',') + '\n';
      fs.appendFileSync(output, line, { encoding: 'utf8' });
      bar.tick();
    } catch (e) {
      console.error(e);
    }
  }
  console.log('Done writing '+source+' profiles to '+output);
});
