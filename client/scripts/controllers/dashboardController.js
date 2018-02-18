take12App.controller('DashboardController', ['$scope', 'UserService',
                      'UtilitiesService', 'RegistryDataService', '$mdDialog',
                    function($scope, UserService, UtilitiesService,
                      RegistryDataService, $mdDialog) {

  $scope.validRegistry = true;
  var homeUrl = 'https://' + location.host + '/#/registry/';

  $scope.dashboardRegistry = UserService.userObject.currentRegistry;
//betsy testing below
  $scope.stripeInfo = UserService.userObject;
//end of testing
  // list of states for state selection
  $scope.states = UtilitiesService.states;

  // validates that there is information to display
  if ($scope.dashboardRegistry) {
    $scope.fullURL = homeUrl + $scope.dashboardRegistry.registryURL;
    $scope.dashboardRegistry.firstName = UtilitiesService.titleCase($scope.dashboardRegistry.firstName);
    $scope.dashboardRegistry.lastName = UtilitiesService.titleCase($scope.dashboardRegistry.lastName);
  } else {
    $scope.validRegistry = false;
  }

  $scope.customFullscreen = false;

  // Change Photo dialog
  $scope.showPhotoDialog = function(ev) {
    $mdDialog.show({
      controller: 'DialogController',
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
      if(response != 'cancel') {
        if(response != '') {
          $scope.dashboardRegistry.imageURL = response;
        }
      }
    }, function() {
      console.log('Dialog canceled');
    });
  };

  // Discard Changes
  $scope.discardChanges = function() {
    // go to main page
    UtilitiesService.redirect('/main');
  };

  // Updates registry in the DB
  $scope.saveChanges = function() {
    RegistryDataService.updateRegistry($scope.dashboardRegistry);

    // go to main page
    UtilitiesService.redirect('/main');
  };


}]);
