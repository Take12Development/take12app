take12App.factory('UserService', ['$http', '$location', function($http, $location){
  console.log('User Service Loaded');

  // Stores logged user information
  var userObject = {};

  // Gets logged user
  function getuser() {
    $http.get('/user').then(function(response) {
      if(response.data.email) {
        // user has a curret session on the server
        userObject.email = response.data.email;
        userObject.registries = response.data.registries;
        console.log('User Data: ', userObject);
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
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log(response);
      console.log('Good to see you, ' + response.name + '.');
      var token = FB.getAuthResponse().accessToken;
      // $cookies.put('accesstoken', access_token);

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

      // var sendData = {};
      // sendData.facebookid = response.id;
      // sendData.firstName = lowerFirst;
      // sendData.lastName = lowerLast;
      // sendData.email = response.id;
      // sendData.cloudinaryImage = "";
      // // sendData.password = "";
      // sendData.amount = 0;
      // sendData.currentAmount = 0;
      // sendData.description1 = "";
      // sendData.description2 = "";
      // sendData.startDate = new Date();
      // sendData.endDate = new Date();
      // sendData.private = false;
      // sendData.newAccount = true;
      //
      // // console.log(sendData);
      //
      // $http.post('fblogin/auth/facebook/token?access_token=' + token, sendData).then(handleSuccess, handleFailure);
      // // , sendData
      //
      // function handleSuccess(response) {
      //     // console.log('created or found fb user', response.data);
      //     $cookies.put('auth', response);
      //     var fbUserAuthResponse = response.data;
      //     $cookies.put('dbacct', response.data['_id']);
      //     // console.log('fb', response.data['_id']);
      //     // console.log('fbUserAuthResponse.newaccount', fbUserAuthResponse.newAccount);
      //
      //     if(fbUserAuthResponse.newAccount === false) {
      //       facebookData.registryData.push(response.data);
      //
      //       // console.log('Not a new user,Redirecting to dashboard');
      //       RouteService.registryHomeRoute();
      //     } else {
      //
      //       facebookData.registryData.push(response.data);
      //       RouteService.fbregistryRoute();
      //     }
      //
      // }
      // function handleFailure(response) {
      //     // console.log('facebook logged Failure Logging In', response);
      //     // alert('We couldn\'t authenticate with Facebook, please try again.');
      //     if(sweetAlert) {
      //     swal({
      //       html: '<h1 class="sweetAlertTextMagenta">We couldn\'t authenticate with Facebook, please try again.</h1>',
      //       type: 'error',
      //       showConfirmButton: false,
      //       timer: 1500
      //     }).then(
      //       function () {},
      //       // handling the promise rejection
      //       function (dismiss) {
      //         RouteService.signinRoute();
      //         signout();
      //       }
      //     )
      //   } else {
      //     alert('We couldn\'t authenticate with Facebook, please try again.');
      //     $location.path('/');
      //   }
      // }

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
