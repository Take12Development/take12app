take12App.factory('RegistryDataService', ['$http','$q', 'UserService',
                  function($http,$q,UserService) {

  console.log('Registry Data Service Loaded');

  // Stores all registries in the DB
  var registriesObject = {
    allRegistries: [],
    userRegistries: []
  };

  // Gets all registries in the database
  getRegistries = function(){
    $http.get('/registry/all').then(function(response) {
      console.log('Back from the server with:', response);
      registriesObject.allRegistries = response.data;
      console.log('Updated registriesObject:', registriesObject.allRegistries);
    });
  };

  // function that uses a promise to handle the $http call to get
  // the registry item from the database
  getRegistry = function(registryURL) {
    var deferred = $q.defer();
    $http.get('/registry/' + registryURL)
    .then(function(response) {
        deferred.resolve(response);
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
  };

  // gets all registries that are part of array received as a parameter
  getUserRegistries = function(arrayOfRegistries) {
    var deferred = $q.defer();
    $http.post('/registry/getuserregistries', {registries: arrayOfRegistries})
    .then(function(response) {
        deferred.resolve(response);
        registriesObject.userRegistries = response.data;
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
  };

  // Posts a new registry to the database
  postRegistry = function(registry) {
    var deferred = $q.defer();
    var registryToPost = angular.copy(registry);

    $http.post('/registry/add', registryToPost)
    .then(function(response) {
        deferred.resolve(response);
        console.log('Back from POST with', response.data);
        UserService.userObject.currentRegistry = angular.copy(response.data);
        console.log('factory currentRegistry',UserService.userObject.currentRegistry);
    })
    .catch(function(response) {
      deferred.reject(response);
    });
    return deferred.promise;
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
    getUserRegistries : getUserRegistries,
    postRegistry : postRegistry,
    updateRegistry : updateRegistry
  };

}]);
