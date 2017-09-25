take12App.controller('ClaimRegistriesController', ['$scope', 'UserService', 'UtilitiesService',
                      'RegistryDataService',
                      function($scope, UserService, UtilitiesService, RegistryDataService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;
  $scope.registriesToClaim = RegistryDataService.registriesObject.registriesToClaim;

  console.log('userObject:', $scope.userObject);

  var registriesArray = $scope.userObject.registriesToClaim;
  console.log('registriesArray', registriesArray);

  // Calls Factory function that gets registries information for current user from the database
  RegistryDataService.getRegistriesToClaim($scope.userObject.registriesToClaim).then(function(data){

    console.log('back from server with:', data);
    if (data.data != "") {
      $scope.registriesToClaim = RegistryDataService.registriesObject.registriesToClaim;
    }
  })
  .catch(function(response){
      console.log(response.status);
  });

  $scope.goToRegistry = function(registry) {
    UserService.userObject.currentRegistry = angular.copy(registry);
    // UtilitiesService.redirect('/registry');
  };

  $scope.claim = function(registry) {
    RegistryDataService.claimRegistry(registry);
    UserService.userObject.currentRegistry = angular.copy(registry);;
    UtilitiesService.redirect('/dashboard');
  };


}]);
