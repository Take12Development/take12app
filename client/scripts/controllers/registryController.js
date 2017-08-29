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
    $scope.currentRegistry.firstName = UtilitiesService.titleCase($scope.currentRegistry.firstName);
    $scope.currentRegistry.lastName = UtilitiesService.titleCase($scope.currentRegistry.lastName);
    console.log('$scope.currentRegistry',$scope.currentRegistry);
  })
  .catch(function(response){
      console.log(response.status);
  });

  // PIE Chart
  var ctx = "myChart";
  var myStaticChart = new Chart(ctx, {
      type: 'pie',
      data: {
      datasets: [
          {
              data: [20, 50, 30],
              backgroundColor: [
                  "#dedede",
                  "#6acbc4",
                  "#f7aca0"
              ],
              hoverBackgroundColor: [
                  "#dedede",
                  "#6acbc4",
                  "#f7aca0"
              ]
          }],
      labels: ["Days Left", "Days Provided", "Days Gifted"]

    }
    });

}]);
