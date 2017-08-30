take12App.controller('DashboardController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

$scope.dashboardRegistry = UserService.userObject.currentRegistry;
$scope.fullURL = REGISTRY_URL + $scope.dashboardRegistry.registryURL;


}]);
