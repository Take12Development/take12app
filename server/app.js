var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');

var passport = require('./strategies/userStrategy');
var session = require('express-session');

// Route includes
var index = require('./routes/index');
var uploads = require('./routes/uploads');
var user = require('./routes/user');
var register = require('./routes/register');
var registry = require('./routes/registry');

var mongoDB = require('./modules/db');

// Body parser middleware
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve back static files
app.use(express.static('./server/public'));

// Passport Session Configuration //
app.use(session({
   secret: 'take12secret12',
   key: 'user',
   resave: 'true',
   saveUninitialized: false,
   cookie: { maxage: 60000, secure: false }
}));

// start up passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/register', register);
app.use('/user', user);
app.use('/registry', registry);
app.use('/uploads', uploads);

// Login error response
app.get('/error', function(req, res) {
  res.send({message: 'Unable to log in. Please try again.'});
});

app.use('/*', index);

// App Set //
app.set('port', (process.env.PORT || 5000));

// App Set //
app.set('port', (process.env.PORT || 5000));

// Listen //
app.listen(app.get("port"), function(){
   console.log("Listening on port: " + app.get("port"));
});
