take12App.controller('RegistryController', ['$scope', '$http', '$routeParams',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  console.log('params is:', $routeParams.registryUrl);

  $scope.validRegistry = true;

  // Calls Factory function that gets registry information from the database
  RegistryDataService.getRegistry($routeParams.registryUrl).then(function(data){

    console.log('back from server with:', data);
    if (data.data != "") {
      $scope.validRegistry = true;
      $scope.currentRegistry = data.data;
      $scope.currentRegistry.firstName = UtilitiesService.titleCase($scope.currentRegistry.firstName);
      $scope.currentRegistry.lastName = UtilitiesService.titleCase($scope.currentRegistry.lastName);
      $scope.fullURL = REGISTRY_URL + $scope.currentRegistry.registryURL;
      $scope.numberOfComments = $scope.currentRegistry.comments.length;
      console.log('$scope.currentRegistry',$scope.currentRegistry);

      // PIE Chart
      var ctx = "myChart";
      var myStaticChart = new Chart(ctx, {
          type: 'pie',
          data: {
                  labels: ["Days Left", "Days Provided", "Days Gifted"],
                  datasets: [{
                    backgroundColor: [
                        "#dedede",
                        "#6acbc4",
                        "#f7aca0"
                    ],
                    hoverBackgroundColor: [
                        "#dedede",
                        "#6acbc4",
                        "#f7aca0"
                    ],
                    data: [20, 50, 30]
                  }]
              },
            options: {
              legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                      fontColor: 'rgb(255, 99, 132)'
                  }
              }
            }
        }); // End of Pie Chart

    } else {
      $scope.validRegistry = false;
    }
    console.log('Valid Registry?', $scope.validRegistry);
  })
  .catch(function(response){
      console.log(response.status);
  });

  // Slider
  $scope.slider = {
    minValue: 15,
    options: {
      floor: 0,
      ceil: 500,
      step: 15,
      showTicks: false,
      hidePointerLabels: true,
    }
  };

}]);
