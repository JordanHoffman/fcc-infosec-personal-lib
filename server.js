'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');


var MongoClient = require('mongodb').MongoClient;
var helmet = require('helmet')
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//SECURITY REQUIREMENTS
app.use(helmet.noCache())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

MongoClient.connect(process.env.DATABASE, {useUnifiedTopology:true}, (err, client) => 
{
  //IMPORTANT: this code is now updated for Mongo 3.0 where the connect function now returns the client and the db comes from the client
  var db = client.db('AdvNodeExpressDBChallenges')
  if(err) 
  {
    console.log('Database error: ' + err);
  } else 
  {
    console.log('Successful database connection');
    //For FCC testing purposes
    fccTestingRoutes(app);

    //Routing for API 
    apiRoutes(app, db);  

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
      console.log("Listening on port " + process.env.PORT);
      if(process.env.NODE_ENV==='test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch(e) {
            var error = e;
              console.log('Tests are not valid:');
              console.log(error);
          }
        }, 1500);
      }
    });

    module.exports = app; //for unit/functional testing
  }
})
