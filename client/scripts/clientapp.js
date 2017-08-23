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
    .when('/registerWho', {
      templateUrl: '/views/templates/registerWho.html',
      controller: 'RegistrationController'
    })
    // Register new user (step1)
    .when('/registerMainInfo', {
      templateUrl: '/views/templates/registerMainInfo.html',
      controller: 'RegistrationController'
    })
    // Register new user (step2)
    .when('/registerPhoto', {
      templateUrl: '/views/templates/registerPhoto.html',
      controller: 'RegistrationController'
    })
    // Register new user (step3)
    .when('/registerStory', {
      templateUrl: '/views/templates/registerStory.html',
      controller: 'RegistrationController'
    })
    // Register new user (step4)
    .when('/registerPrivacy', {
      templateUrl: '/views/templates/registerPrivacy.html',
      controller: 'RegistrationController'
    })
    // How to plan for your maternity leave
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
    .otherwise({
      redirectTo: 'home'
    });
}]);
