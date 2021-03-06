take12App.controller('RegistrationController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService', 'MailService', 'StripeService',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService, MailService,
                    StripeService) {

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
    paidWeeks: 0,
    goalAmtEntryOpt: 1,
    netIncome: 0,
    paidWeeksPercentage: 0,
    forWhom: ''
  };

  // list of states for state selection
  $scope.states = UtilitiesService.states;

  // variables used for navigation among registration views. Possible values:
  // registerWho = 0, registerMainInfo = 1, registerPhoto = 2,
  // registerStory = 3, registerPrivacy = 4, , registerStripe = 5
  $scope.visibleStep = 0;

  // validation's message
  $scope.message = '';

  // checks if email is empty (the user has logged in with facebook)
  if (UserService.userObject.email) {
    $scope.requestEmail = false;
  } else {
    $scope.requestEmail = true;
  }

  // starts registration based on parameter(self or lovedOne)
  $scope.startRegistration = function(who) {
    // add code to differentiate between self and lovedOne
    if (who == 'self') {
      $scope.self = true;
      $scope.registry.email = UserService.userObject.email;
      $scope.registry.forWhom = 'self';
    } else {
      $scope.self = false;
      $scope.registry.organizerEmail = UserService.userObject.email;
      $scope.registry.forWhom = 'lovedone';
    }
    $scope.visibleStep = 1;
  };

  // opens how to plan information on separate window
  $scope.goToHowToPlan = function() {
    var howToPlanUrl = 'https://' + location.host + '/#/howToPlan';
    $window.open(howToPlanUrl, '_blank');
  };

  // compares pasword and password confirmation entered by the user
  function comparePasswords() {
    var validPassword = false;
    if ($scope.newUser.password === $scope.newUser.password) {
      validPassword = true;
    } else {
      validPassword = false;
    }
    return validPassword;
  }

  // registers a new user
  $scope.registerUser = function() {
    if($scope.newUser.email === '' || $scope.newUser.password === '' || $scope.newUser.confirmPassword === '') {
      $scope.message = "Please enter all the required information";
    } else {
        if (comparePasswords()) {
          $http.post('/register', $scope.newUser).then(function(response) {
            UtilitiesService.showAlert('Your account has been created, please login to create your registry');
            UtilitiesService.redirect('/login');
          },
          function(response) {
            $scope.message = "Please try again.";
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
        FB.api('/me', function(response) {
          var token = FB.getAuthResponse().accessToken;
          $http.post('fblogin/auth/facebook/token?access_token=' + token).then(handleSuccess, handleFailure);
          function handleSuccess(response) {
            if(response.data.registries.length != 0) {
              // Existing user: Presents registry dashboard
              UtilitiesService.redirect('/main');
            } else {
              // New user: Presents registration views
              UtilitiesService.redirect('/registration');
            }
          }
          function handleFailure(response) {
            console.log('facebook logged Failure Logging In', response);
          }
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
      // saves filename to use when saving registry
      filename = response.data.secure_url;
      $scope.registry.imageURL = filename;

      $timeout(function () {
        file.result = response.data;
        // saves filename to use when saving registry
        filename = response.data.secure_url;
        $scope.registry.imageURL = filename;
      });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      }, function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    };

  // Calls factory function that saves registry to the Database
  $scope.saveAndComplete = function() {
    // calculate goalAmount for users who selected option 1 in goalAmount entry
    if($scope.registry.goalAmtEntryOpt == '1') {
      calculateGoalAmt();
    }
    // For facebook users we attach fb id to insert email in user account
    // console.log('UserService.userObject.facebookId: ',UserService.userObject.facebookId);
    if (UserService.userObject.facebookId) {
      $scope.registry.facebookId = UserService.userObject.facebookId;
    }
    // checks if it is a registry for the user or for a loved one
    if ($scope.registry.forWhom == 'self') {
      RegistryDataService.postSelfRegistry($scope.registry).then(function() {
        //Go to final step (Initiate Stripe)
        $scope.goNext(4);
      }).catch(function(response){
          console.log(response.status);
      });
    } else {
      RegistryDataService.postLovedOneRegistry($scope.registry).then(function() {
        //Go to final step (Initiate Stripe)
        $scope.goNext(4);
      }).catch(function(response){
          console.log(response.status);
      });
    }
  };

  // moves forward - registration view
  $scope.goNext = function(step) {
    $scope.visibleStep = parseInt(step) + 1;
  };

  // moves backwards - registration view
  $scope.goBack = function(step) {
    $scope.visibleStep = parseInt(step) - 1;
  };

  function calculateGoalAmt() {
    // 12 week income considering 6 pay periods in 12 weeks
    var twelveWeekIncome = $scope.registry.netIncome * 6;
    // weekly income
    var weeklyIncome = twelveWeekIncome / 12;

    // Calculate short term disability pay
    var shortTermDisPay = ($scope.registry.paidWeeks * weeklyIncome) * $scope.registry.paidWeeksPercentage / 100;

    // Calculate goal amount
    $scope.registry.goalAmount = Math.round(twelveWeekIncome - shortTermDisPay);
  }

  //initiates new deferred stripe account
 $scope.initiateStripe = function() {
   StripeService.createAccount($scope.registry);
   //go to registry dashboard
   UtilitiesService.redirect('/dashboard');
 };


}]);
