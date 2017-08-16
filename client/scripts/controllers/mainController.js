take12App.controller('MainController', ['$scope', 'UserService',
                                    function($scope, UserService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UserService.redirect;

  console.log('userObject:', $scope.userObject);

}]);
