take12App.controller('ThankYouController', ['$scope', 'UtilitiesService',
                    function($scope, UtilitiesService) {

  // uses goHome function from UtilitiesService
  $scope.goHome = UtilitiesService.goHome;

}]);
