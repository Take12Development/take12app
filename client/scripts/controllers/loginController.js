take12App.controller('LoginController', ['$scope', '$http', '$location', 'UserService',
                    function($scope, $http, $location, UserService) {

  $scope.user = {
    email: '',
    password: ''
  };

  $scope.message = '';

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
            $location.path('/main');
          } else {
            // New user: Presents registration views
            $location.path('/registration',response.data);
          }
        } else {
          console.log('failure: ', response);
          $scope.message = "Invalid combination of email and password.";
        }
      });
    }
  };

}]);
