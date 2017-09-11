take12App.factory('UserService', ['$http', '$location', 'UtilitiesService',
                  function($http, $location, UtilitiesService){
  console.log('User Service Loaded');

  // Stores logged user information
  var userObject = {};

  // Gets logged user
  function getuser() {
    $http.get('/user').then(function(response) {
      console.log('GETUSER', response);
      if(response.data.email) {
        // user has a curret session on the server
        userObject.email = response.data.email;
        userObject.registries = response.data.registries;
        console.log('GETUSER: User Data: ', userObject);
      } else if (response.data.facebookId)  {
        userObject.facebookId = response.data.facebookId;
        userObject.registries = response.data.registries;
      } else {
        // user has no session, bounce them back to the login page
        $location.path("/home");
      }
    });
  };

  // Logs out the user
  function logout() {
    $http.get('/user/logout').then(function(response) {
      console.log('logged out');
      $location.path("/home");
    });
  };

///////////////////////////////////////////////////////////////////////////////

// facebook login
function fblogin() {
  console.log('In fblogin');
  FB.login(function(response) {
    if (response.authResponse) {
    console.log('USER SERVICE: Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log(response);
      console.log('US: Good to see you, ' + response.name + '.');
      var token = FB.getAuthResponse().accessToken;

      if(response.name) {
          var fullName = response.name;
      } else {
          var fullName = "UPDATE NAME";
      }

      // console.log(fullName);
      var fName = fullName.split(' ').slice(0, -1).join(' ');
      var lName = fullName.split(' ').slice(-1).join(' ');

      var lowerFirst = fName.toLowerCase();
      var lowerLast = lName.toLowerCase();

      console.log(lowerFirst, lowerLast);

      var sendData = {};
      sendData.facebookid = response.id;
      sendData.firstName = lowerFirst;
      sendData.lastName = lowerLast;
      sendData.email = response.email;

      console.log('US: sendData',sendData);

      // $http.post('fblogin/auth/facebook/token?access_token=' + token, sendData).then(handleSuccess, handleFailure);
      $http.post('fblogin/auth/facebook/token?access_token=' + token).then(handleSuccess, handleFailure);

      function handleSuccess(response) {
        console.log('USERSERVICE CONTROLLER: created or found FB user', response.data);
        if(response.data.registries.length != 0) {
          // Existing user: Presents registry dashboard
          UtilitiesService.redirect('/main');
          console.log('MAIN');
        } else {
          // New user: Presents registration views
          UtilitiesService.redirect('/registration');
          console.log('REGISTRATION');
        }
      };
      function handleFailure(response) {
        console.log('facebook logged Failure Logging In', response);
      };

     });
    } else {
    //  console.log('User cancelled login or did not fully authorize.');
    }
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
      console.log('Already logged into facebook, here is your data', response);
    } else if (response.status === 'not_authorized') {
      // the user is logged in to Facebook,
      // but has not authenticated your app
      console.log('Not logged in but i can handle that 1', response);
      fblogin();
    } else {
      // the user isn't logged in to Facebook.
      console.log('Not logged in but i can handle that 2', response);
      fblogin();
    }
   }, true);
};


  return {
    userObject : userObject,
    getuser : getuser,
    logout : logout,
    checkLoginState : checkLoginState,
    fblogin : fblogin

  };
}]);
