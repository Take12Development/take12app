take12App.controller('RegistrationController', ['$scope', '$http', '$location', '$window', 'UserService',
                    function($scope, $http, $location, $window, UserService) {

  $scope.user = {
    email: '',
    password: ''
  };

  $scope.message = '';

  $scope.goTo = function(view) {
    $location.url(view);
  }

  $scope.goToHowToPlan = function() {
    // THIS HAS TO BE REPLACED WITH CORRECT URL
    $window.open('http://localhost:5000/#/howToPlan', '_blank');
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
            // $location.path('/home');
            $scope.goTo('/registerWho');
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
