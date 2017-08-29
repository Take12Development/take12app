take12App.controller('MainController', ['$scope', 'UserService', 'UtilitiesService',
                      'RegistryDataService',
                      function($scope, UserService, UtilitiesService, RegistryDataService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;
  $scope.userRegistries = RegistryDataService.registriesObject.userRegistries;

  console.log('userObject:', $scope.userObject);

  // get information of registries associated with user
  RegistryDataService.getUserRegistries($scope.userObject.registries);
  console.log('factory', RegistryDataService.registriesObject.userRegistries);
  console.log('scope',$scope.userRegistries);


}]);
