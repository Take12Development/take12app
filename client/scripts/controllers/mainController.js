take12App.controller('MainController', ['$scope', 'UserService', 'UtilitiesService',
                                    function($scope, UserService, UtilitiesService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;

  console.log('userObject:', $scope.userObject);

}]);
