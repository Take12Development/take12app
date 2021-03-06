var take12App = angular.module('take12App', ['ngRoute', 'ngMaterial', 'ngFileUpload',
                'ngMessages', 'textAngular', 'rzModule', '720kb.socialshare']);

// Angular Material Theme Configuration
take12App.config(['$mdThemingProvider', function($mdThemingProvider) {
   $mdThemingProvider.theme('altTheme').primaryPalette('grey').accentPalette('grey');
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
    // Forgot password view
    .when('/forgotpassword', {
      templateUrl: '/views/templates/forgotPassword.html',
      controller: 'LoginController'
    })
    // change password view (accesible through email link)
    .when('/confirmreset/:code', {
      templateUrl: '/views/templates/confirm.html',
      controller: 'LoginController'
    })
    // Register new user View
    .when('/register', {
      templateUrl: '/views/templates/registerUsername.html',
      controller: 'RegistrationController'
    })
    // Request email view (for facebook users)
    .when('/requestemail', {
      templateUrl: '/views/templates/requestEmail.html',
      controller: 'RequestEmailController',
      resolve: {
        getuser : ['UserService', function(UserService){
          return UserService.getuser();
        }]
      }
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
    // Claim registries view
    .when('/claimregistries', {
      templateUrl: '/views/templates/claimRegistries.html',
      controller: 'ClaimRegistriesController',
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
    // checkout
    .when('/checkout', {
      templateUrl: '/views/templates/checkout.html',
      controller: 'CheckoutController',
    })
    // Thank you page
    .when('/thankyou', {
      templateUrl: '/views/templates/thankYou.html',
      controller: 'ThankYouController'
    })
    // Transaction Error View
    .when('/transactionError/:errorMessage', {
      templateUrl: '/views/templates/transactionError.html',
      controller: 'TransactionErrorController',
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

// Facebook authentication
take12App.run([ function() {

  window.fbAsyncInit = function() {
    FB.init({
      appId      : FACEBOOK_APP_ID,
      xfbml      : true,
      version    : 'v2.10'
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

}]);
