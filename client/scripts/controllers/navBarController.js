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
