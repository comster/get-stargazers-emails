
/**
 * Module dependencies.
 */

var request = require('./request');

/**
 * Access token.
 */

var accessToken = process.env.GITHUB_ACCESS_TOKEN || '';

function sleep(ms) {
  return function(fn) {
    setTimeout(fn, ms);
  }
}

/**
 * Get stargazers from repo.
 */

exports.getStargazers = function *(repo) {
  var page = 0;
  var stargazers = [];
  do {
    yield exports.waitIfLimited();
    var url = 'https://api.github.com/repos/' + repo + '/stargazers?page=' + page + '&access_token=' + accessToken;
    var res = yield request.get(url);
    var users = res.body;
    for (var i = 0; i < users.length; i++) {
      stargazers.push(users[i].login);
    }
    if (users.length < 25) break;
    page += 1;
  } while (true);
  return stargazers;
};

/**
 * Get forkers?
 */

exports.getForkers = function *(repo) {
  var page = 0;
  var forkers = [];
  do {
    yield exports.waitIfLimited();
    var url = 'https://api.github.com/repos/' + repo + '/forks?page=' + page + '&access_token=' + accessToken;
    var res = yield request.get(url);
    var forkedRepos = res.body;
    for (var i = 0; i < forkedRepos.length; i++) {
      forkers.push(forkedRepos[i].owner.login);
    }
    if (forkedRepos.length < 25) break;
    page += 1;
  } while (true);
  return forkers;
};

/**
 * Get email from github usernane.
 */

exports.getEmail = function *(username) {
  yield exports.waitIfLimited();
  var url = 'https://api.github.com/users/' + username + '?access_token=' + accessToken;
  var res = yield request.get(url);
  var user = res.body;
  return {
    username: user.login,
    name: user.name,
    email: user.email,
    location: user.location,
    hireable: user.hireable
  };
};

/**
 * Get rate limit
 */
 
exports.getLimit = function *() {
  var url = 'https://api.github.com/rate_limit?access_token=' + accessToken;
  var res = yield request.get(url);
  var limits = res.body;
  return {
    remaining: limits.resources.core.remaining,
    reset: limits.resources.core.reset,
  };
}

exports.getResetFromNow = function *() {
  var limit = yield exports.getLimit();
  // console.log(limit);
  if(limit.remaining == 0) {
    // should wait until limit.reset
    var dt = new Date().getTime();
    var diff = (limit.reset * 1000) - dt;
    // console.log('wait for '+diff+' to begin calling API again');
    return diff;
  }
  return 0;
}

exports.waitIfLimited = function *() {
  var waitTime = yield exports.getResetFromNow();
  if(waitTime !== 0) {
    console.log('Waiting for '+waitTime+'ms until API limit is reset...');
    yield sleep(waitTime + 10000); // plus 10s buffer time
    console.log('... starting API calls again.')
    yield exports.waitIfLimited();
  }
  return;
}
