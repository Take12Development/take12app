take12App.controller('LoginController', ['$scope', '$http', 'UserService',
                    'UtilitiesService',
                    function($scope, $http, UserService, UtilitiesService) {

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
          console.log('success: ', response.data);
          if(response.data.registries.length != 0) {
            // Existing user: Presents registry dashboard
            UtilitiesService.redirect('/main');
          } else {
            // New user: Presents registration views
            UtilitiesService.redirect('/registration');
          }
        } else {
          console.log('failure: ', response);
          $scope.message = "Invalid combination of email and password.";
        }
      });
    }
  };

  // logs a facebook user into the system
  $scope.fblogin = function() {
    FB.login(function(response) {
      if (response.authResponse) {
        console.log('LC: Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log(response);
          console.log('LC: Good to see you, ' + response.name + '.');
          var token = FB.getAuthResponse().accessToken;
          $http.post('fblogin/auth/facebook/token?access_token=' + token).then(handleSuccess, handleFailure);
          function handleSuccess(response) {
            console.log('LC CONTROLLER: created or found FB user', response.data);
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


}]);
