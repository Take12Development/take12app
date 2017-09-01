take12App.controller('DashboardController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService', '$mdDialog',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService, $mdDialog) {

$scope.validRegistry = true;

$scope.dashboardRegistry = UserService.userObject.currentRegistry;

// validates that there is information to display
if ($scope.dashboardRegistry) {
  $scope.fullURL = REGISTRY_URL + $scope.dashboardRegistry.registryURL;
  $scope.dashboardRegistry.firstName = UtilitiesService.titleCase($scope.dashboardRegistry.firstName);
  $scope.dashboardRegistry.lastName = UtilitiesService.titleCase($scope.dashboardRegistry.lastName);

} else {
  $scope.validRegistry = false;
}

$scope.status = '  ';
$scope.customFullscreen = false;

// Change Photo dialog
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

// filename stores the picture filename assigned by the uploadPic function
var filename;

// Upload picture file Section
$scope.uploadPic = function(file) {
  console.log('uploadPic()',file);
  file.upload = Upload.upload({
    url: '/uploads',
    // data: {name: UserService.userObject.email, file: file},
    data: {file: file},
  });

  file.upload.then(function (response) {
    console.log('0 Back from upload with data:',response.data);
    // saves filename to use when saving registry
    // filename in localhost:
    filename = response.data.file.path + "/" + response.data.file.originalname;
    // updated filename that works with aws
    // filename = response.data.file.location;
    $scope.dashboardRegistry.imageURL = filename;
    $timeout(function () {
      file.result = response.data;
      console.log('1 Back from upload with data:',response.data);
      // filename in localhost:
      filename = response.data.file.path + "/" + response.data.file.originalname;
      // updated filename that works with aws
      // filename = response.data.file.location;
      $scope.dashboardRegistry.imageURL = filename;
    });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
        console.log('2 Back from upload with data:',response.data);
        console.log('URL is:',filename);
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  };


}]);
