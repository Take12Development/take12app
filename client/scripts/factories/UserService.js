take12App.factory('UserService', ['$http', '$location', function($http, $location){
  console.log('User Service Loaded');

  // Stores logged user information
  var userObject = {};

  // Redirects to view received as a parameter
  function redirect(page) {
    console.log('inpage navigation', page);
    $location.url(page);
  }

  return {
    userObject : userObject,
    redirect : redirect,
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
