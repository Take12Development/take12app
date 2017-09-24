take12App.factory('RegistryDataService', ['$http','$q', 'UserService',
                  function($http,$q,UserService) {

  // Stores all registries in the DB
  var registriesObject = {
    allRegistries: [],
    userRegistries: [],
    registriesToClaim: [],
    currentViewedRegistry: {}
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

  // gets all registries that are part of array received as a parameter for
  // registries to claim
  getRegistriesToClaim = function(arrayOfRegistries) {
    var deferred = $q.defer();
    $http.post('/registry/getuserregistries', {registries: arrayOfRegistries})
    .then(function(response) {
        deferred.resolve(response);
        registriesObject.registriesToClaim = response.data;
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

  // claims registry (adds url to user)
  claimRegistry = function(registry) {
    var registryToClaim = angular.copy(registry);
    console.log('Claiming registry: ', registryToClaim);
    $http.put('/registry/claim', registryToClaim).then(function(response) {
      console.log('success:',response);
    });
  }

  return {
    registriesObject : registriesObject,
    getRegistries : getRegistries,
    getRegistry : getRegistry,
    getUserRegistries : getUserRegistries,
    getRegistriesToClaim : getRegistriesToClaim,
    postRegistry : postRegistry,
    updateRegistry : updateRegistry,
    claimRegistry : claimRegistry
  };

}]);
