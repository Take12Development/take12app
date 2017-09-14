take12App.controller('RegistryController', ['$scope', '$http', '$routeParams',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  console.log('params is:', $routeParams.registryUrl);

  $scope.validRegistry = true;
  // Chart values
  var numWeeksProvided = 0;
  var numWeeksGifted = 0;
  var numWeeksNeeded = 12 - numWeeksProvided - numWeeksGifted;

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

      calculateChartValues();

      // PIE Chart
      var ctx = "myChart";
      var myStaticChart = new Chart(ctx, {
          type: 'pie',
          data: {
                  labels: ["Weeks Needed", "Weeks Provided", "Weeks Gifted"],
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
                    data: [numWeeksNeeded, numWeeksProvided, numWeeksGifted]
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
    minValue: 20,
    options: {
      floor: 0,
      ceil: 2000,
      step: 20,
      showTicks: false,
      hidePointerLabels: true,
    }
  };

  // calculate values for pie chart based on user entries
  function calculateChartValues() {

    // get number of weeks provided by employer
    // if ($scope.currentRegistry.paidWeeks) {
    //   numWeeksProvided = $scope.currentRegistry.paidWeeks;
    // }
    numWeeksProvided = 6;
    
    // calculate amount to cover One week of maternity leave:
    var oneWeekAmount = $scope.currentRegistry.goalAmount /
                        (12 - numWeeksProvided);
    // calculate number of weeks gifted based on amount being gifted
    if ($scope.currentRegistry.currentAmount != 0) {
      numWeeksGifted = oneWeekAmount / $scope.currentRegistry.currentAmount;
    } else {
      numWeeksGifted = 0;
    }
    // calculate number of weeks needed:
    numWeeksNeeded = 12 - numWeeksProvided - numWeeksGifted;
  }

}]);
