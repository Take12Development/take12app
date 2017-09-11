take12App.controller('RegistrationController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  // variable used to display labels for self or loved one's registry
  $scope.self = true;
  // variable used to display input for email
  $scope.requestEmail = true;

  // stores information to save a new user into the DB
  $scope.newUser = {
    email: '',
    password: '',
    registries: []
  };

  // new registry information
  $scope.registry = {
    firstName: '',
    lastName: '',
    goalAmount: 0,
    createDate: new Date(),
    dueDate: '',
    imageURL: '',
    story: '',
    privacy: 'public',
    email: '',
    organizerEmail: '',
    city: '',
    state: '',
    paidDays: 0
  }

  // list of states for state selection
  $scope.states = UtilitiesService.states;

  console.log('in the controller: ',UserService.userObject);

  // variables used for navigation among registration views. Possible values:
  // registerWho = 0, registerMainInfo = 1, registerPhoto = 2,
  // registerStory = 3, registerPrivacy 4
  $scope.visibleStep = 0;

  // validation's message
  $scope.message = '';

  // checks if email is empty (the user has logged in with facebook)
  if (UserService.userObject.email) {
    console.log("NOT EMPTY EMAIL", UserService.userObject.email);
    $scope.requestEmail = false;
  } else {
    console.log("EMPTY EMAIL");
    $scope.requestEmail = true;
  }

  // starts registration based on parameter(self or lovedOne)
  $scope.startRegistration = function(who) {
    // add code to differentiate between self and lovedOne
    if (who == 'self') {
      $scope.self = true;
      $scope.registry.email = UserService.userObject.email;
    } else {
      $scope.self = false;
      $scope.registry.organizerEmail = UserService.userObject.email;
    }
    $scope.visibleStep = 1;
  };

  // opens how to plan information on separate window
  $scope.goToHowToPlan = function() {
    // THIS HAS TO BE REPLACED WITH CORRECT URL
    $window.open(HOW_TO_PLAN_URL, '_blank');
  };

  // compares pasword and password confirmation entered by the user
  function comparePasswords() {
    var validPassword = false;
    if ($scope.newUser.password === $scope.newUser.confirmPassword) {
      var validPassword = true;
    } else {
      var validPassword = false;
    }
    return validPassword;
  };

  // registers a new user
  $scope.registerUser = function() {
    if($scope.newUser.email === '' || $scope.newUser.password === '' || $scope.newUser.confirmPassword === '') {
      $scope.message = "Please enter all the required information";
    } else {
        if (comparePasswords()) {
          console.log('sending to server...', $scope.newUser);
          $http.post('/register', $scope.newUser).then(function(response) {
            console.log('success');
            UtilitiesService.showAlert('Your account has been created, please login to create your registry');
            UtilitiesService.redirect('/login');
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

  // registers a new user with facebook credentials
  $scope.fbSignUp = function() {
    FB.login(function(response) {
    if (response.authResponse) {
      console.log('REGISTRATION CONTROLLER: Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log('RC: Good to see you, ' + response.name + '.');
          var token = FB.getAuthResponse().accessToken;

          if(response.name) {
              var fullName = response.name;
          } else {
              var fullName = "UPDATE NAME";
          }

          console.log(fullName);
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

          console.log('RC: sendData',sendData);

          $http.post('fblogin/auth/facebook/token?access_token=' + token, sendData).then(handleSuccess, handleFailure);

          function handleSuccess(response) {
            console.log('REGISTRATION CONTROLLER: created or found FB user', response.data);
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
      console.log('User cancelled login or did not fully authorize.');
    }
    });
  };


  // filename stores the picture filename assigned by the uploadPic function
  var filename;
  // Upload picture file Section
  $scope.uploadPic = function(file) {
    file.upload = Upload.upload({
      url: '/uploads',
      data: {file: file},
    });

    file.upload.then(function (response) {
      console.log('0 Back from upload with data:',response);
      // saves filename to use when saving registry
      filename = response.data.secure_url;
      $scope.registry.imageURL = filename;

      $timeout(function () {
        file.result = response.data;
        console.log('1 Back from upload with data:',response);
        // saves filename to use when saving registry
        filename = response.data.secure_url;
        $scope.registry.imageURL = filename;
      });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
          console.log('2 Back from upload with data:',response.data);
          console.log('URL is:',filename);
      }, function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    };

  // Calls factory function that saves registry to the Database
  $scope.saveAndComplete = function() {
    // For facebook users we attach fb id to insert email in user account
    console.log('UserService.userObject.facebookId: ',UserService.userObject.facebookId);
    if (UserService.userObject.facebookId) {
      $scope.registry.facebookId = UserService.userObject.facebookId;
    }
    console.log('SENDING TO postRegistry', $scope.registry);
    RegistryDataService.postRegistry($scope.registry).then(function() {
      // go to registry dashboard
      UtilitiesService.redirect('/dashboard');
    }).catch(function(response){
        console.log(response.status);
    });
  };

  // moves forward - registration view
  $scope.goNext = function(step) {
    console.log('Registry:', $scope.registry);
    $scope.visibleStep = parseInt(step) + 1;
  };

  // moves backwards - registration view
  $scope.goBack = function(step) {
    console.log('Registry:', $scope.registry);
    $scope.visibleStep = parseInt(step) - 1;
  };

}]);
