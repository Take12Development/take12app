var take12App = angular.module('take12App', ['ngRoute','ngMaterial','ngFileUpload','textAngular']);

// Angular Material Theme Configuration
take12App.config(['$mdThemingProvider', function($mdThemingProvider) {
   $mdThemingProvider.theme('altTheme').primaryPalette('grey').accentPalette('blue-grey');
}]);

// textAngular toolbar customization
take12App.config(['$provide', function($provide){
	// this demonstrates how to register a new tool and add it to the default toolbar
	$provide.decorator('taOptions', ['$delegate', function(taOptions){
		// $delegate is the taOptions we are decorating
		// here we override the default toolbars and classes specified in taOptions.
		taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
		taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
		taOptions.toolbar = [
			// ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
			// ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['bold', 'italics', 'underline', 'ul', 'ol','justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
			// ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
			// ['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
		];
		taOptions.classes = {
			focussed: 'focussed',
			toolbar: 'btn-toolbar',
			toolbarGroup: 'btn-group',
			toolbarButton: 'md-raised textEditorButton',
			toolbarButtonActive: 'active',
			disabled: 'disabled',
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		};
		return taOptions; // whatever you return will be the taOptions
	}]);
}]);

/// Routes ///
take12App.config(['$routeProvider', '$locationProvider',
      function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('');

  $routeProvider
    // Login View is our home view until integrated with static content
    .when('/home', {
      templateUrl: '/views/templates/home.html',
      controller: 'LoginController',
    })
    // Login View
    .when('/login', {
      templateUrl: '/views/templates/home.html',
      controller: 'LoginController',
    })
    // Register new user View
    .when('/register', {
      templateUrl: '/views/templates/registerUsername.html',
      controller: 'RegistrationController'
    })
    // Register new user (step0)
    .when('/registration', {
      templateUrl: '/views/templates/registration.html',
      controller: 'RegistrationController',
      resolve: {
        getuser : ['UserService', function(UserService){
          return UserService.getuser();
        }]
      }
    })
    // How to Plan information
    .when('/howToPlan', {
      templateUrl: '/views/templates/howToPlan.html',
      controller: 'RegistrationController'
    })
    // Main View of the app
    .when('/main', {
      templateUrl: '/views/templates/main.html',
      controller: 'MainController',
      resolve: {
        getuser : ['UserService', function(UserService){
          return UserService.getuser();
        }]
      }
    })
    // Registry dashboard
    .when('/dashboard', {
      templateUrl: '/views/templates/dashboard.html',
      controller: 'DashboardController',
      resolve: {
        getuser : ['UserService', function(UserService){
          return UserService.getuser();
        }]
      }
    })
    .otherwise({
      redirectTo: 'home'
    });
}]);

take12App.controller('DashboardController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {


}]);

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
          if(response.data.registryURL && response.data.registryURL != "") {
            // Existing user: Presents registry dashboard
            $location.path('/main');
          } else {
            // New user: Presents register views
            $location.path('/registration');
          }
        } else {
          console.log('failure: ', response);
          $scope.message = "Invalid combination of email and password.";
        }
      });
    }
  };

}]);

take12App.controller('MainController', ['$scope', 'UserService', 'UtilitiesService',
                                    function($scope, UserService, UtilitiesService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;

  console.log('userObject:', $scope.userObject);

}]);

take12App.controller('navBarController', ['$scope', '$location','UtilitiesService',
                      function($scope, $location, UtilitiesService) {
  var originatorEv;
  $scope.redirect = UtilitiesService.redirect;

  // Displays menu options
  $scope.openMenu = function($mdMenu, ev) {
    originatorEv = ev;
    $mdMenu.open(ev);
  };

}]);

take12App.controller('RegistrationController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  // stores information to save a new user into the DB
  $scope.newUser = {
    email: '',
    password: '',
    registryURL: ''
  };

  // new registry information
  $scope.registry = {
    firstName: '',
    lastName: '',
    goalAmount: 0,
    dueDate: '',
    imageURL: '',
    story: '',
    privacy: 'public',
    email: '',
    organizerEmail: ''
  }

  console.log('in the controller: ',UserService.userObject);

  // variables used for navigation among registration views. Possible values:
  // registerWho = 0, registerMainInfo = 1, registerPhoto = 2,
  // registerStory = 3, registerPrivacy 4
  $scope.visibleStep = 0;

  // validation's message
  $scope.message = '';

  // starts registration based on parameter(self or lovedOne)
  $scope.startRegistration = function(who) {
    // add code to differentiate between self and lovedOne
    $scope.visibleStep = 1;
    if (who == 'self') {
      $scope.registry.email = UserService.userObject.email;
    } else {
      $scope.registry.organizerEmail = UserService.userObject.email;
    }
  };

  // opens how to plan information on separate window
  $scope.goToHowToPlan = function() {
    // THIS HAS TO BE REPLACED WITH CORRECT URL
    $window.open('http://localhost:5000/#/howToPlan', '_blank');
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

// filename stores the picture filename assigned by the uploadPic function
var filename;

// Upload picture file Section
$scope.uploadPic = function(file) {
  file.upload = Upload.upload({
    url: '/uploads',
    // data: {name: UserService.userObject.email, file: file},
    data: {file: file},
  });

  file.upload.then(function (response) {
    console.log('0 Back from upload with data:',response.data);
    // saves filename to use when saving registry
    // filename in localhost:
    filename = response.data.file.path + "/" + response.data.file.originalname;
    // updated filename that works with aws
    // filename = response.data.file.location;
    $scope.registry.imageURL = filename;
    $timeout(function () {
      file.result = response.data;
      console.log('1 Back from upload with data:',response.data);
      // filename in localhost:
      filename = response.data.file.path + "/" + response.data.file.originalname;
      // updated filename that works with aws
      // filename = response.data.file.location;
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
    console.log('Registry:', $scope.registry);
    RegistryDataService.postRegistry($scope.registry);

    // go to registry dashboard
    UtilitiesService.redirect('/dashboard');
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

take12App.factory('RegistryDataService', ['$http', function($http){

  console.log('Registry Data Service Loaded');

  // Stores all registries in the DB
  var registriesObject = {
    allRegistries: []
  };

  // Gets all registries in the database
  getRegistries = function(){
    $http.get('/registry/all').then(function(response) {
      console.log('Back from the server with:', response);
      registriesObject.allRegistries = response.data;
      console.log('Updated registriesObject:', registriesObject.allRegistries);
    });
  };

  // Gets a specific registry from the database
  getRegistry = function(){
    $http.get('/registry').then(function(response) {
      console.log('Back from the server with:', response);
      registriesObject.allRegistries = response.data;
      console.log('Updated registriesObject:', registriesObject.allRegistries);
    });
  };

  // Posts a new registry to the database
  postRegistry = function(registry) {
    var registryToPost = angular.copy(registry);
    console.log('Posting registry: ', registryToPost);
    $http.post('/registry/add', registryToPost).then(function(response) {
      console.log('success:',response);
    });
  };

  // Updates a specific registry
  updateRegistry = function(registry) {
    var registryToUpdate = angular.copy(registry);
    console.log('Updating registry: ', registryToUpdate);
    $http.put('/registry/update', registryToUpdate).then(function(response) {
      console.log('success:',response);
    });
  };

  return {
    registriesObject : registriesObject,
    getRegistries : getRegistries,
    getRegistry : getRegistry,
    postRegistry : postRegistry,
    updateRegistry : updateRegistry
  };

}]);

take12App.factory('UserService', ['$http', '$location', function($http, $location){
  console.log('User Service Loaded');

  // Stores logged user information
  var userObject = {};

  return {
    userObject : userObject,
    // Gets logged user
    getuser : function(){
      $http.get('/user').then(function(response) {
        if(response.data.email) {
          // user has a curret session on the server
          userObject.email = response.data.email;
          userObject.registryURL = response.data.registryURL;
          console.log('User Data: ', userObject);
        } else {
          // user has no session, bounce them back to the login page
          $location.path("/home");
        }
      });
    },
    // Logs out the user
    logout : function() {
      $http.get('/user/logout').then(function(response) {
        console.log('logged out');
        $location.path("/home");
      });
    }
  };
}]);

take12App.factory('UtilitiesService', ['$mdDialog', '$location',
                  function($mdDialog, $location){

  // shows alert modal window
  showAlert = function(message) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(message)
          .ariaLabel(message)
          .ok('Ok')
      );
  };

  // Redirects to view received as a parameter
  function redirect(page) {
    $location.url(page);
  }

return {
    showAlert: showAlert,
    redirect : redirect
};

}]);
