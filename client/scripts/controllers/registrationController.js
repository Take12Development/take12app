take12App.controller('RegistrationController', ['$scope', '$http', '$location',
                      '$window', '$timeout', 'Upload', 'UserService', 'UtilitiesService',
                    function($scope, $http, $location, $window, $timeout, Upload,
                    UserService,UtilitiesService) {

  $scope.user = {
    email: '',
    password: '',
    registryURL: ''
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
            UtilitiesService.showAlert('Your account has been created, please login to create your registry');
            // $location.path('/home');
            $scope.goTo('/login');
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

// filename stores the picture filename assigned by the uploadPic function
var filename;

// Upload picture file Section
$scope.uploadPic = function(file) {
  var tempUsername = "claudia.calderas@gmail.com"
  console.log('name:',UserService.userObject.email);
  file.upload = Upload.upload({
    url: '/uploads',
    // data: {name: UserService.userObject.email, file: file},
    data: {name: tempUsername, file: file},
  });

  file.upload.then(function (response) {
    // console.log('0 Back from upload with data:',response.data);
    // saves filename to use when saving recipe
    // filename in localhost:
    // filename = response.data.file.path + "/" + response.data.file.originalname;
    // updated filename that works with aws
    // filename = response.data.file.location;
    // console.log('URL is:',filename);

    $timeout(function () {
      file.result = response.data;
      // console.log('1 Back from upload with data:',response.data);
      // filename in localhost:
      // filename = response.data.file.path + "/" + response.data.file.originalname;
      // updated filename that works with aws
      // filename = response.data.file.location;
      // console.log('URL is:',filename);

    });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
        // console.log('2 Back from upload with data:',response.data);
        // console.log('URL is:',filename);

    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  }

}]);
