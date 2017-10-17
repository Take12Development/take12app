take12App.controller('navBarController', ['$scope', '$location','$mdDialog','UtilitiesService', 'UserService',
                      function($scope, $location, $mdDialog, UtilitiesService, UserService) {
  var originatorEv;
  $scope.redirect = UtilitiesService.redirect;
  $scope.loggedInUser = UserService.userObject.loggedInUser;
  console.log('navBarController', UserService.userObject.loggedInUser);

  // logs in or logs out user
  $scope.loginout = function() {
    console.log('navBarController', UserService.userObject.loggedInUser);
    if (UserService.userObject.loggedInUser == true) {
      UserService.logout();
      UtilitiesService.showAlert('You have been logged out of the system');
    }
  }

  // Displays menu options
  $scope.openMenu = function($mdMenu, ev) {
    originatorEv = ev;
    $mdMenu.open(ev);
  };

}]);
