var mongoose = require('mongoose');

// Mongo Connection //
var mongoURI = '';
// process.env.MONGODB_URI will only be defined if you
// are running on Heroku
if(process.env.MONGODB_URI != undefined) {
  // use the string value of the environment variable
  mongoURI = process.env.MONGODB_URI;
} else {
  // use the local database server
  // mongoURI = 'mongodb://localhost:27017/take12db';
  //mlab Heroku add on
  mongoURI = 'mongodb://heroku_b2qkgz11:hb000ec6gbahvtv41r1r9h2onc@ds161713.mlab.com:61713/heroku_b2qkgz11';
}

var mongoDB = mongoose.connect(mongoURI).connection;

mongoDB.on('error', function(err){
 if(err) {
   console.log("MONGO ERROR: ", err);
 }
 res.sendStatus(500);
});

mongoDB.once('open', function(){
  console.log("Connected to Mongo");
});

module.exports = mongoDB;
