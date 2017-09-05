var take12App = angular.module('take12App', ['ngRoute','ngMaterial','ngFileUpload','textAngular','rzModule']);

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
    // Public registry
    .when('/registry/:registryUrl', {
      templateUrl: '/views/templates/registry.html',
      controller: 'RegistryController',
    })
    // Find registry
    .when('/findRegistry', {
      templateUrl: '/views/templates/findRegistry.html',
      controller: 'FindRegistryController',
      controllerAs: 'vm'
    })
    // Public registry
    .when('/publicRegistry', {
      templateUrl: '/views/templates/publicRegistry.html',
      controller: 'FindRegistryController',
      controllerAs: 'vm'
    })
    .otherwise({
      redirectTo: 'home'
    });
}]);

take12App.controller('DashboardController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService', '$mdDialog',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService, $mdDialog) {

$scope.validRegistry = true;

console.log('currentRegistry in dashboard:', UserService.userObject.currentRegistry);
$scope.dashboardRegistry = UserService.userObject.currentRegistry;

// list of states for state selection
$scope.states = UtilitiesService.states;

// validates that there is information to display
if ($scope.dashboardRegistry) {
  $scope.fullURL = REGISTRY_URL + $scope.dashboardRegistry.registryURL;
  $scope.dashboardRegistry.firstName = UtilitiesService.titleCase($scope.dashboardRegistry.firstName);
  $scope.dashboardRegistry.lastName = UtilitiesService.titleCase($scope.dashboardRegistry.lastName);
} else {
  $scope.validRegistry = false;
};

$scope.customFullscreen = false;

// Change Photo dialog
$scope.showPhotoDialog = function(ev) {
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'views/partials/changePhotoDialog.html',
    locals: {
      photoURL: ''
    },
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true,
    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
  })
  .then(function(response) {
    console.log('.then',response);
    if(response != 'cancel') {
      if(response != '') {
        $scope.dashboardRegistry.imageURL = response;
        console.log('OK $scope.dashboardRegistry.imageURL',$scope.dashboardRegistry.imageURL);
      }
    }
  }, function() {
    console.log('Dialog canceled');
  });
};

// Controls functionality of modal window for photo changing
function DialogController($scope, $mdDialog, photoURL ) {
  var dialogCtrl = this;
  dialogCtrl.photoURL = photoURL;

  // dialog select and close function (triggered by ok button)
  $scope.selectAndClose = function() {
    $mdDialog.hide(dialogCtrl.photoURL);
  };

  // dialog cancel function
  $scope.cancel = function() {
    $mdDialog.cancel('cancel');
  };

  // Upload picture file Section
  var filename;
  $scope.uploadPic = function(file) {
    console.log('uploadPic()',file);
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
      dialogCtrl.photoURL = filename;

      $timeout(function () {
        file.result = response.data;
        console.log('1 Back from upload with data:',response.data);
        // filename in localhost:
        filename = response.data.file.path + "/" + response.data.file.originalname;
        // updated filename that works with aws
        // filename = response.data.file.location;
        dialogCtrl.photoURL = filename;
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
  } // end of DialogController

  // Discard Changes
  $scope.discardChanges = function() {
    // go to main page
    UtilitiesService.redirect('/main');
  }

  // Updates registry in the DB
  $scope.saveChanges = function() {
    console.log('Dashboard Registry:', $scope.dashboardRegistry);
    RegistryDataService.updateRegistry($scope.dashboardRegistry);

    // go to main page
    UtilitiesService.redirect('/main');
  }


}]);

take12App.controller('FindRegistryController', ['$http',
                      'RegistryDataService',
  function($http, RegistryDataService) {

  //controller reference
  var vm = this;
  // Calls Factory Function that GETS all registries from the db
  vm.getRegistries = RegistryDataService.getRegistries;
  //Stores all registries from db
  vm.registriesObject = RegistryDataService.registriesObject;
  //Limit for the string length of the story
  vm.limit = 200;

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
          UserService.userObject.registries = response.data.registries;
          console.log('success: ', response.data);
          if(response.data.registries.length != 0) {
            // Existing user: Presents registry dashboard
            $location.path('/main');
          } else {
            // New user: Presents registration views
            // $location.path('/registration',response.data);
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
                      'RegistryDataService',
                      function($scope, UserService, UtilitiesService, RegistryDataService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;
  $scope.userRegistries = RegistryDataService.registriesObject.userRegistries;

  console.log('userObject:', $scope.userObject);

  var registriesArray = $scope.userObject.registries;
  console.log('registriesArray', registriesArray);

  // Calls Factory function that gets registries information for current user from the database
  RegistryDataService.getUserRegistries($scope.userObject.registries).then(function(data){

    console.log('back from server with:', data);
    if (data.data != "") {
      $scope.userRegistries = RegistryDataService.registriesObject.userRegistries;

      console.log('factory', RegistryDataService.registriesObject.userRegistries);
      console.log('scope',$scope.userRegistries);
    }
  })
  .catch(function(response){
      console.log(response.status);
  });

  $scope.newRegistry = function() {
    UtilitiesService.redirect('/registration')
  };

  $scope.goToRegistryDashboard = function(registry) {
    UserService.userObject.currentRegistry = angular.copy(registry);
    UtilitiesService.redirect('/dashboard');
  };




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

  // variable used to display labels for self or loved one's registry
  $scope.self = true;

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

take12App.controller('RegistryController', ['$scope', '$http', '$routeParams',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  console.log('params is:', $routeParams.registryUrl);

  $scope.validRegistry = true;

  // Calls Factory function that gets registry information from the database
  RegistryDataService.getRegistry($routeParams.registryUrl).then(function(data){

    console.log('back from server with:', data);
    if (data.data != "") {
      $scope.validRegistry = true;
      $scope.currentRegistry = data.data;
      $scope.currentRegistry.firstName = UtilitiesService.titleCase($scope.currentRegistry.firstName);
      $scope.currentRegistry.lastName = UtilitiesService.titleCase($scope.currentRegistry.lastName);
      $scope.numberOfComments = $scope.currentRegistry.comments.length;
      console.log('$scope.currentRegistry',$scope.currentRegistry);
      
      // PIE Chart
      var ctx = "myChart";
      var myStaticChart = new Chart(ctx, {
          type: 'pie',
          data: {
                  labels: ["Days Left", "Days Provided", "Days Gifted"],
                  datasets: [{
                    backgroundColor: [
                        "#dedede",
                        "#6acbc4",
                        "#f7aca0"
                    ],
                    hoverBackgroundColor: [
                        "#dedede",
                        "#6acbc4",
                        "#f7aca0"
                    ],
                    data: [20, 50, 30]
                  }]
              },
            options: {
              legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                      fontColor: 'rgb(255, 99, 132)'
                  }
              }
            }
        }); // End of Pie Chart

    } else {
      $scope.validRegistry = false;
    }
    console.log('Valid Registry?', $scope.validRegistry);
  })
  .catch(function(response){
      console.log(response.status);
  });

  // Slider
  $scope.slider = {
    minValue: 15,
    options: {
      floor: 0,
      ceil: 500,
      step: 15,
      showTicks: false,
      hidePointerLabels: true,
    }
  };

}]);

const REGISTRY_URL = 'https://take12development.herokuapp.com/#/registry/';
const HOW_TO_PLAN_URL = 'https://take12development.herokuapp.com/#/howToPlan';

take12App.factory('RegistryDataService', ['$http','$q', 'UserService',
                  function($http,$q,UserService) {

  console.log('Registry Data Service Loaded');

  // Stores all registries in the DB
  var registriesObject = {
    allRegistries: [],
    userRegistries: []
  };

  // Gets all registries in the database
  getRegistries = function(){
    $http.get('/registry/all').then(function(response) {
      console.log('Back from the server with:', response);
      registriesObject.allRegistries = response.data;
      console.log('Updated registriesObject:', registriesObject.allRegistries);
    });
  };

  // function that uses a promise to handle the $http call to get
  // the registry item from the database
  getRegistry = function(registryURL) {
    var deferred = $q.defer();
    $http.get('/registry/' + registryURL)
    .then(function(response) {
        deferred.resolve(response);
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
  };

  // gets all registries that are part of array received as a parameter
  getUserRegistries = function(arrayOfRegistries) {
    var deferred = $q.defer();
    $http.post('/registry/getuserregistries', {registries: arrayOfRegistries})
    .then(function(response) {
        deferred.resolve(response);
        registriesObject.userRegistries = response.data;
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
  };

  // Posts a new registry to the database
  postRegistry = function(registry) {
    var deferred = $q.defer();
    var registryToPost = angular.copy(registry);

    $http.post('/registry/add', registryToPost)
    .then(function(response) {
        deferred.resolve(response);
        console.log('Back from POST with', response.data);
        UserService.userObject.currentRegistry = angular.copy(response.data);
        console.log('factory currentRegistry',UserService.userObject.currentRegistry);
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
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
    getUserRegistries : getUserRegistries,
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
          userObject.registries = response.data.registries;
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

  titleCase = function (stringParam) {
    return stringParam.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };

  // list of states
   var states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
      'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
      'WY').split(' ').map(function(state) {
          return {abbrev: state};
  });

  // Redirects to view received as a parameter
  function redirect(page) {
    $location.url(page);
  }

return {
    showAlert: showAlert,
    redirect : redirect,
    titleCase : titleCase,
    states: states
};

}]);
