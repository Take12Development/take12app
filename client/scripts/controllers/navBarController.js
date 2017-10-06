take12App.controller('navBarController', ['$scope', '$location','UtilitiesService', 'UserService',
                      function($scope, $location, UtilitiesService, UserService) {
  var originatorEv;
  $scope.redirect = UtilitiesService.redirect;
  $scope.loggedInUser = UserService.userObject.loggedInUser;
  console.log('navBarController', UserService.userObject.loggedInUser);

  // Displays menu options
  $scope.openMenu = function($mdMenu, ev) {
    originatorEv = ev;
    $mdMenu.open(ev);
  };

}]);
