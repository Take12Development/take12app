var take12App = angular.module('take12App', ['ngRoute','ngMaterial','ngFileUpload']);

// Angular Material Theme Configuration
take12App.config(['$mdThemingProvider', function($mdThemingProvider) {
   $mdThemingProvider.theme('altTheme').primaryPalette('grey').accentPalette('blue-grey');
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
