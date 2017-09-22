take12App.controller('TransactionErrorController', ['$scope', '$http', '$routeParams',
                      '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

console.log('params is:', $routeParams.errorMessage);

$scope.errorMessage = $routeParams.errorMessage;


}]);
