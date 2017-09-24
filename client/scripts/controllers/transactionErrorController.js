take12App.controller('TransactionErrorController', ['$scope', '$routeParams', 'UtilitiesService',
                    function($scope, $routeParams, UtilitiesService) {

  // uses goHome function from UtilitiesService
  $scope.goHome = UtilitiesService.goHome;
  // error message received from Stripe transaction in server
  $scope.errorMessage = $routeParams.errorMessage;
}]);
