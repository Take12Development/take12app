var passport = require('passport');
var FacebookTokenStrategy = require('passport-facebook-token');
var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var fs = require('fs');
var path = require('path');

// Facebook Strategy takes json config file if config vars are not available
var facebookAppId = '';
var facebookAppSecret = '';
if(process.env.FACEBOOK_APP_ID != undefined &&
  process.env.FACEBOOK_APP_SECRET != undefined) {
    facebookAppId = process.env.FACEBOOK_APP_ID;
    facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);

  facebookAppId = configValues.facebook.FACEBOOK_APP_ID;
  facebookAppSecret = configValues.facebook.FACEBOOK_APP_SECRET;
}

// Store this user's unique id in the session for later reference
// Only runs during authentication
// Stores info on req.session.passport.user
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Runs on every request after user is authenticated
// Look up the user's id in the session and use it to find them in the DB for each request
// result is stored on req.user
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(err) {
      done(err);
    }
    done(null, user);
  });
});

// Does actual work of logging in
// Called by middleware stack
passport.use('local', new localStrategy({
  passReqToCallback: true,
  usernameField: 'email'
}, function(req, email, password, done) {
    // mongoose
    User.findOne({email: email}, function(err, user) {
      if(err) {
        throw err;
      }

      // user variable passed to us from Mongoose if it found a match to findOne() above
      if(!user) {
        // user not found
        console.log('userStrategy.js :: no user found');
        return done(null, false, {message: 'Incorrect credentials.'});
      } else {
        // found user! Now check their given password against the one stored in the DB
        // comparePassword() is defined in the schema/model file!
        user.comparePassword(password, function(err, isMatch) {
          if(err) {
            throw err;
          }

          if(isMatch) {
            // all good, populate user object on the session through serializeUser
            console.log('userStrategy.js :: all good');
            return(done(null, user));
          } else {
            // no good.
            console.log('userStrategy.js :: password incorrect');
            done(null, false, {message: 'Incorrect credentials.'});
          }
        });
      } // end else
    }); // end findOne
  } // end callback
));

// Facebook Strategy
passport.use(new FacebookTokenStrategy({
    clientID: facebookAppId,
    clientSecret: facebookAppSecret
  }, function(accessToken, refreshToken, profile, done) {

    User.findOne({facebookId: profile.id}, function(err, user) {
      if(err) {
        throw err;
      }
      if(!user) {
        // user not found
        console.log('Facebook Strategy :: New User');
        // console.log('profile is:', profile);
        // inserts newUser in user table
        var newUser = {};
        newUser.facebookId = profile.id;
        newUser.registries = [];

        User.create(newUser, function(err, user) {
             if(err) {
               console.log('ERR',err);
              //  return done(null, false, {message: 'There was a problem creating your user in Take12'});
             } else {
              console.log('USER', user);
              return(done(null, user));
             }
        });
      } else {
        // found user!
        console.log('Facebook Strategy.js :: all good');
        return(done(null, user));
      } // end else
    }); // end findOne
  }
));

module.exports = passport;
