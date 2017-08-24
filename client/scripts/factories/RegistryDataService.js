take12App.factory('RegistryDataService', ['$http', function($http){

  console.log('Registry Data Service Loaded');

  // Stores all registries in the DB
  var registriesObject = {
    allRegistries: []
  };

  // Gets all registries in the database
  getRegistries = function(){
    $http.get('/registry/all').then(function(response) {
      console.log('Back from the server with:', response);
      registriesObject.allRegistries = response.data;
      console.log('Updated registriesObject:', registriesObject.allRegistries);
    });
  };

  // Gets a specific registry from the database
  getRegistry = function(){
    $http.get('/registry').then(function(response) {
      console.log('Back from the server with:', response);
      registriesObject.allRegistries = response.data;
      console.log('Updated registriesObject:', registriesObject.allRegistries);
    });
  };

  // Posts a new registry to the database
  postRegistry = function(registry) {
    var registryToPost = angular.copy(registry);
    console.log('Posting registry: ', registryToPost);
    $http.post('/registry/add', registryToPost).then(function(response) {
      console.log('success:',response);
    });
  };

  // Updates a specific registry
  updateRegistry = function(registry) {
    var registryToUpdate = angular.copy(registry);
    console.log('Updating registry: ', registryToUpdate);
    $http.put('/registry/update', registryToUpdate).then(function(response) {
      console.log('success:',response);
    });
  };

  return {
    registriesObject : registriesObject,
    getRegistries : getRegistries,
    getRegistry : getRegistry,
    postRegistry : postRegistry,
    updateRegistry : updateRegistry
  };

}]);