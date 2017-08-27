take12App.controller('RegistryController', ['$scope', '$http', '$routeParams',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  console.log('params is:', $routeParams.registryUrl);


  // Calls Factory function that gets registry information from the database
  RegistryDataService.getRegistry($routeParams.registryUrl).then(function(data){

    console.log('back from server with:', data);
    $scope.currentRegistry = data.data;
    console.log('$scope.currentRegistry',$scope.currentRegistry);
  })
  .catch(function(response){
      console.log(response.status);
  });

}]);
