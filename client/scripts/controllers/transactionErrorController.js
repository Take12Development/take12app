take12App.controller('TransactionErrorController', ['$scope', '$routeParams', 'UtilitiesService',
                    function($scope, $routeParams, UtilitiesService) {

  // uses goHome function from UtilitiesService
  $scope.goHome = UtilitiesService.goHome;

  console.log('params is:', $routeParams.errorMessage);
  $scope.errorMessage = $routeParams.errorMessage;


}]);
