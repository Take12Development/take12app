take12App.factory('UserService', ['$http', '$location', function($http, $location){
  console.log('User Service Loaded');

  // Stores logged user information
  var userObject = {};

  return {
    userObject : userObject,
    // Gets logged user
    getuser : function(){
      $http.get('/user').then(function(response) {
        if(response.data.email) {
          // user has a curret session on the server
          userObject.email = response.data.email;
          userObject.registryURL = response.data.registryURL;
          console.log('User Data: ', userObject);
        } else {
          // user has no session, bounce them back to the login page
          $location.path("/home");
        }
      });
    },
    // Logs out the user
    logout : function() {
      $http.get('/user/logout').then(function(response) {
        console.log('logged out');
        $location.path("/home");
      });
    }
  };
}]);
