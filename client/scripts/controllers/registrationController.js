take12App.controller('RegistrationController', ['$scope', '$http', '$location', 'UserService',
                    function($scope, $http, $location, UserService) {

  $scope.user = {
    email: '',
    password: ''
  };

  $scope.message = '';

  $scope.goToStep1 = function() {
    $location.url('/register1');
  }

  // compares pasword and password confirmation entered by the user
  function comparePasswords() {
    var validPassword = false;
    if ($scope.user.password === $scope.user.confirmPassword) {
      var validPassword = true;
    } else {
      var validPassword = false;

    }
    return validPassword;
  }

  // registers a new user
  $scope.registerUser = function() {
    if($scope.user.email === '' || $scope.user.password === '' || $scope.user.confirmPassword === '') {
      $scope.message = "Please enter all the required information";
    } else {
        if (comparePasswords()) {
          console.log('sending to server...', $scope.user);
          $http.post('/register', $scope.user).then(function(response) {
            console.log('success');
            $location.path('/home');
          },
          function(response) {
            console.log('error');
            $scope.message = "Please try again."
          });
      } else {
        $scope.message = "Password doesn't match password confirmation.";
      }
    }
  };
}]);
