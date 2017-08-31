take12App.controller('DashboardController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService', '$mdDialog',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService, $mdDialog) {

$scope.dashboardRegistry = UserService.userObject.currentRegistry;
$scope.fullURL = REGISTRY_URL + $scope.dashboardRegistry.registryURL;
$scope.dashboardRegistry.firstName = UtilitiesService.titleCase($scope.dashboardRegistry.firstName);
$scope.dashboardRegistry.lastName = UtilitiesService.titleCase($scope.dashboardRegistry.lastName);
$scope.status = '  ';
$scope.customFullscreen = false;


$scope.showPhotoDialog = function(ev) {
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'views/partials/changePhotoDialog.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true,
    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
  })
  .then(function(answer) {
    $scope.status = 'ok';
  }, function() {
    $scope.status = 'You cancelled the dialog.';
  });
};

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}


}]);
