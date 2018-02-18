take12App.controller('FindRegistryController', ['$http', '$scope',
                      'RegistryDataService', 'UtilitiesService',
  function($http, $scope, RegistryDataService, UtilitiesService) {

  //controller reference
  var vm = this;
  // Calls Factory Function that GETS all registries from the db
  vm.getRegistries = RegistryDataService.getRegistries;
  //Stores all registries from db
  vm.registriesObject = RegistryDataService.registriesObject;
  //Limit for the string length of the story
  vm.limit = 200;
  //Provides proper capitilization for names
  vm.titleCase = UtilitiesService.titleCase;

  vm.redirect = UtilitiesService.redirect;

  // $scope.showRegistry = function(registryURL) {
  //   var registryFullPath = '/registry/' + registryURL;
  //   UtilitiesService.redirect(registryFullPath);
  // };

  $scope.showRegistry = function(registry) {
    if(registry.privacy !== 'private') {
      var registryFullPath = '/registry/' + registry.registryURL;
      UtilitiesService.redirect(registryFullPath);
    } else {
    }
  };

  }]);
