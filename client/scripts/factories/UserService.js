take12App.factory('UserService', ['$http', '$q', 'UtilitiesService',
                  function($http, $q, UtilitiesService){

  // Stores logged user information
  var userObject = {};

  // Gets logged user
  function getuser() {
    $http.get('/user').then(function(response) {
      if(response.data.email) {
        // user has a curret session on the server
        userObject.email = response.data.email;
        userObject.registries = response.data.registries;
      } else if (response.data.facebookId)  {
        userObject.facebookId = response.data.facebookId;
        userObject.registries = response.data.registries;
        // console.log('FB GETUSER: User Data: ', userObject);
      } else {
        // user has no session, bounce them back to the login page
        UtilitiesService.redirect("/home");
      }
    });
  }

  // Logs out the user
  function logout() {
    $http.get('/user/logout').then(function(response) {
      console.log('logged out');
      UtilitiesService.redirect("/home");
    });
  }

  // Checks Facebook login status
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // the user is logged in and has authenticated your
        // app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed
        // request, and the time the access token
        // and signed request each expire
        var uid = response.authResponse.userID;
        var accessToken = response.authResponse.accessToken;
        // console.log('Already logged into facebook, here is your data', response);
      } else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook,
        // but has not authenticated your app
        fblogin();
      } else {
        // the user isn't logged in to Facebook.
        fblogin();
      }
     }, true);
  }

  function updateFBUserEmail(parameterObject) {
    var deferred = $q.defer();
    var parameters = angular.copy(parameterObject);

    $http.post('/user/updatefbuseremail', parameters)
    .then(function(response) {
        deferred.resolve(response);
        UserService.userObject = angular.copy(response.data);
        // console.log('updateFBUserEmail UserService.userObject', UserService.userObject);
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
  }

  return {
    userObject : userObject,
    getuser : getuser,
    logout : logout,
    checkLoginState : checkLoginState,
    updateFBUserEmail : updateFBUserEmail
  };
}]);
