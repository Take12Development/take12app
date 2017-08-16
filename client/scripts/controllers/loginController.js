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
          console.log('success: ', response.data);
          $location.path('/main');
        } else {
          console.log('failure: ', response);
          $scope.message = "Invalid combination of email and password.";
        }
      });
    }
  };

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
