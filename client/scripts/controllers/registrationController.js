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

  // registers a new user
  $scope.registerUser = function() {
    if($scope.user.email === '' || $scope.user.password === '') {
      $scope.message = "Choose a email and password combination!";
    } else {
      console.log('sending to server...', $scope.user);
      $http.post('/register', $scope.user).then(function(response) {
        console.log('success');
        $location.path('/home');
      },
      function(response) {
        console.log('error');
        $scope.message = "Please try again."
      });
    }
  };
}]);
