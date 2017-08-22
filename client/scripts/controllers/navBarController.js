take12App.controller('navBarController', ['$scope', '$location','UserService', function($scope, $location, UserService) {
  var originatorEv;
  $scope.redirect = UserService.redirect;

  // Displays menu options
  $scope.openMenu = function($mdMenu, ev) {
    originatorEv = ev;
    $mdMenu.open(ev);
  };

}]);
