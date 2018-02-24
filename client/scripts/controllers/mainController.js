take12App.controller('MainController', ['$scope', 'UserService', 'UtilitiesService',
                      'RegistryDataService',
                      function($scope, UserService, UtilitiesService, RegistryDataService) {
  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;
  $scope.userRegistries = RegistryDataService.registriesObject.userRegistries;

  var registriesArray = $scope.userObject.registries;

  // Calls Factory function that gets registries information for current user from the database
  RegistryDataService.getUserRegistries($scope.userObject.registries).then(function(data){

    if (data.data != "") {
      $scope.userRegistries = RegistryDataService.registriesObject.userRegistries;
    }
  })
  .catch(function(response){
      console.log(response.status);
  });

  $scope.newRegistry = function() {
    UtilitiesService.redirect('/registration');
  };

  $scope.goToRegistryDashboard = function(registry) {
    UserService.userObject.currentRegistry = angular.copy(registry);
    UtilitiesService.redirect('/dashboard');
  };

}]);
