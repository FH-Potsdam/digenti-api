var config = require('./../config');

// HERE API Client
// var client = new Twitter({
//   consumer_key: config.twitter.consumer_key,
//   consumer_secret: config.twitter.consumer_secret,
//   access_token_key: config.twitter.access_token_key,
//   access_token_secret: config.twitter.access_token_secret,
// });

//////////////
// REST API
//////////////

function init(app) {

  // GET search/tweets
  app.get('routing/isolines/', function(req, res){

    // console.log('"twitter/search/tweets" ' + req.method + ' request received');
    // console.log('   - Params: ' + JSON.stringify(req.query) + '\n');
    //
    // var params = req.query;
    //
    // client.get('search/tweets', params, function(err, tweets, response){
    //   if (err) {
    //     res.statusCode = 400;
    //     return res.send('There was an error: ' + err);
    //   }
    //
    //   // Tweets already come in JSON format
    //   console.log('Returning ' + tweets.statuses.length + ' tweets in JSON format...');
    //   res.json(tweets);
    // });
  });

  // POST search/tweets
  app.post('routing/isolines/', function(req, res){

    // console.log('"twitter/search/tweets" ' + req.method + ' request received');
    // console.log('   - Params: ' + JSON.stringify(req.body) + '\n');
    //
    // var params = req.body;
    //
    // client.get('search/tweets', params, function(err, tweets, response){
    //   if (err) {
    //     res.statusCode = 400;
    //     return res.send('There was an error: ' + err);
    //   }
    //
    //   // Tweets already come in JSON format
    //   console.log('Returning ' + tweets.statuses.length + ' tweets in JSON format...');
    //   res.json(tweets);
    // });
  });
}

module.exports.init = init;
