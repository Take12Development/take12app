take12App.controller('LoginController', ['$scope', '$http', '$routeParams', 'UserService',
                    'UtilitiesService',
                    function($scope, $http, $routeParams, UserService, UtilitiesService) {

  $scope.user = {
    email: '',
    password: ''
  };

  $scope.message = '';

  // Facebook methods in UserService:
  $scope.checkLoginState = UserService.checkLoginState;
  // $scope.fblogin = UserService.fblogin;

  // logs a user into the system
  $scope.login = function() {
    if($scope.user.email === '' || $scope.user.password === '') {
      $scope.message = "Enter your email and password!";
    } else {
      $http.post('/', $scope.user).then(function(response) {
        if(response.data.email) {
          UserService.userObject.email = response.data.email;
          UserService.userObject.registries = response.data.registries;
          console.log('*** success: ', response.data);
          // checks if there is a unclaimed registry for this user
          console.log('CHECKING FOR UNCLAIMED REGISTRIES');
          $http.get('/registry/unclaimed/' + UserService.userObject.email).then(function(res) {
            if(res.data) {
              if(res.data.registries.length > 0) {
                // a registry has been created for this user
                console.log('A REGISTRY HAS BEEN CREATED FOR THIS USER');
                console.log(res);
                UserService.userObject.registriesToClaim = res.data.registries;
                UtilitiesService.redirect('/claimregistries');
              } else {
                if(UserService.userObject.registries.length != 0) {
                  // Existing user: Presents registry dashboard
                  UtilitiesService.redirect('/main');
                } else {
                  // New user: Presents registration views
                  UtilitiesService.redirect('/registration');
                }
              }
            } else {
              if(UserService.userObject.registries.length != 0) {
                // Existing user: Presents registry dashboard
                UtilitiesService.redirect('/main');
              } else {
                // New user: Presents registration views
                UtilitiesService.redirect('/registration');
              }
            }
          });
        } else {
          $scope.message = "Invalid combination of email and password.";
        }
      });
    }
  };

  // logs a facebook user into the system
  $scope.fblogin = function() {
    FB.login(function(response) {
      if (response.authResponse) {
        FB.api('/me', function(response) {
          var token = FB.getAuthResponse().accessToken;
          $http.post('fblogin/auth/facebook/token?access_token=' + token).then(handleSuccess, handleFailure);
          function handleSuccess(response) {
            if(response.data.email) {
              UserService.userObject.email = response.data.email;
              UserService.userObject.registries = response.data.registries;
              if(response.data.registries.length != 0) {
                // Existing user: Presents registry dashboard
                UtilitiesService.redirect('/main');
              } else {
                // New user: Presents registration views
                UtilitiesService.redirect('/registration');
              }
            } else {
              // New user: Presents registration views
              UtilitiesService.redirect('/registration');
            }
          };
          function handleFailure(response) {
            console.log('facebook logged Failure Logging In', response);
          };
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  };

  // sends request to get a link to reset the password
  $scope.sendResetPassword = function() {
  if($scope.user.email === '') {
    UtilitiesService.showAlert('Please enter your email address.');
  } else {
    console.log('$scope.user',$scope.user);
    $http.post('/user/forgotpassword', $scope.user).then(function(response) {
      if(response.data == 'Code sent successfully.') {
        UtilitiesService.showAlert('A link to change the password was sent by email.');
      } else {
        UtilitiesService.showAlert('There was an error sending the link to change the password.');
      }
    });
  }
};

// sends request to the server with updated password
$scope.updatePassword = function() {
  // Send our password reset request to the server
  // with our username, new password and code
  if($scope.user.email === '' || $scope.user.password === '') {
    UtilitiesService.showAlert('Please enter your email and password.');
  } else {
    $scope.user.code = $routeParams.code;
    $http.put('/user/resetpassword', $scope.user).then(function(response) {
      if(response.data == 'Password updated successfully.') {
        UtilitiesService.showAlert('Password updated successfully.');
        UtilitiesService.redirect('/home');
      } else {
        UtilitiesService.showAlert('There was an error updating the password');
      }
    });
  }
};

}]);
