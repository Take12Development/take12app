require('newrelic');

var express = require('express');
var app = express();
var wrenchmodeExpress = require('wrenchmode-express');
var bodyParser = require('body-parser');
// var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');

var passport = require('./strategies/userStrategy');
var session = require('express-session');

//Used to handle memory leak caused by express-session's memory-cache
var cookieParser = require('cookie-parser');
var MemoryStore = require('session-memory-store')(session);


// Route includes
var index = require('./routes/index');
var uploads = require('./routes/uploads');
var user = require('./routes/user');
var register = require('./routes/register');
var registry = require('./routes/registry');
var fblogin = require('./routes/fblogin');
var email = require('./routes/email');
var stripe = require('./routes/stripe');

var mongoDB = require('./modules/db');

// Body parser middleware
// app.use(logger('dev'));
app.use(wrenchmodeExpress({
  //For Localhost
  //jwt: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJQcm9qZWN0OjI2OSIsImV4cCI6MTUwODg2MTU3MSwiaWF0IjoxNTA2MjY5NTcxLCJpc3MiOiJXcmVuY2htb2RlIiwianRpIjoiYjJkMmUwOWYtNzMwMi00YmIyLTg0Y2QtOTY0NmVlM2VlODgyIiwicGVtIjp7fSwic3ViIjoiUHJvamVjdDoyNjkiLCJ0eXAiOiJ0b2tlbiJ9.KWqKw3yR6b1iZnOUKHcL7MlIrepTQ3xy-V9YB8kO5Q4V6xDlUzou8idvMDOAS6mb0uu0UoIfs95GsuzWsSshKA"
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//for memory leak
app.use(cookieParser());

// Serve back static files
app.use(express.static('./server/public'));

// Passport Session Configuration //
app.use(session({
   secret: 'take12secret12',
   key: 'user',
   resave: 'true',
   saveUninitialized: false,
   cookie: { maxage: 60000, secure: false },
   store: new MemoryStore()
}));

// start up passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/register', register);
app.use('/user', user);
app.use('/registry', registry);
app.use('/uploads', uploads);
app.use('/fblogin', fblogin);
app.use('/email', email);
app.use('/stripe', stripe);



// Login error response
app.get('/error', function(req, res) {
  res.send({message: 'Unable to log in. Please try again.'});
});

app.use('/*', index);

// App Set //
app.set('port', (process.env.PORT || 5000));

// Listen //
app.listen(app.get("port"), function(){
   console.log("Listening on port: " + app.get("port"));
});
