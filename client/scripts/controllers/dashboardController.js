take12App.controller('DashboardController', ['$scope', '$http',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService', '$mdDialog',
                    function($scope, $http, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService, $mdDialog) {

$scope.validRegistry = true;

console.log('currentRegistry in dashboard:', UserService.userObject.currentRegistry);
$scope.dashboardRegistry = UserService.userObject.currentRegistry;

// list of states for state selection
$scope.states = UtilitiesService.states;

// validates that there is information to display
if ($scope.dashboardRegistry) {
  $scope.fullURL = REGISTRY_URL + $scope.dashboardRegistry.registryURL;
  $scope.dashboardRegistry.firstName = UtilitiesService.titleCase($scope.dashboardRegistry.firstName);
  $scope.dashboardRegistry.lastName = UtilitiesService.titleCase($scope.dashboardRegistry.lastName);
} else {
  $scope.validRegistry = false;
};

$scope.customFullscreen = false;

// Change Photo dialog
$scope.showPhotoDialog = function(ev) {
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'views/partials/changePhotoDialog.html',
    locals: {
      photoURL: ''
    },
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true,
    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
  })
  .then(function(response) {
    console.log('.then',response);
    if(response != 'cancel') {
      if(response != '') {
        $scope.dashboardRegistry.imageURL = response;
        console.log('OK $scope.dashboardRegistry.imageURL',$scope.dashboardRegistry.imageURL);
      }
    }
  }, function() {
    console.log('Dialog canceled');
  });
};

// Controls functionality of modal window for photo changing
function DialogController($scope, $mdDialog, photoURL ) {
  var dialogCtrl = this;
  dialogCtrl.photoURL = photoURL;

  // dialog select and close function (triggered by ok button)
  $scope.selectAndClose = function() {
    $mdDialog.hide(dialogCtrl.photoURL);
  };

  // dialog cancel function
  $scope.cancel = function() {
    $mdDialog.cancel('cancel');
  };

  // Upload picture file Section
  var filename;
  $scope.uploadPic = function(file) {
    file.upload = Upload.upload({
      url: '/uploads',
      data: {file: file},
    });

    file.upload.then(function (response) {
      console.log('0 Back from upload with data:',response);
      // saves filename to use when saving registry
      filename = response.data.secure_url;
      dialogCtrl.photoURL = filename;

      $timeout(function () {
        file.result = response.data;
        console.log('1 Back from upload with data:',response);
        // saves filename to use when saving registry
        filename = response.data.secure_url;
        dialogCtrl.photoURL = filename;
      });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
          console.log('2 Back from upload with data:',response);
          console.log('URL is:',filename);
      }, function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    };
  } // end of DialogController

  // Discard Changes
  $scope.discardChanges = function() {
    // go to main page
    UtilitiesService.redirect('/main');
  }

  // Updates registry in the DB
  $scope.saveChanges = function() {
    console.log('Dashboard Registry:', $scope.dashboardRegistry);
    RegistryDataService.updateRegistry($scope.dashboardRegistry);

    // go to main page
    UtilitiesService.redirect('/main');
  }


}]);
