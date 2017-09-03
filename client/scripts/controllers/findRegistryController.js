take12App.controller('FindRegistryController', ['$http',
                      'RegistryDataService',
  function($http, RegistryDataService) {

  //controller reference
  var vm = this;
  // Calls Factory Function that GETS all registries from the db
  vm.getRegistries = RegistryDataService.getRegistries;
  //Stores all registries from db
  vm.registriesObject = RegistryDataService.registriesObject;
  //Limit for the string length of the story
  vm.limit = 200;

  }]);
