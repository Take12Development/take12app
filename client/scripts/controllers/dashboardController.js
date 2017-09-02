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
      dialogCtrl.photoURL = filename;

      $timeout(function () {
        file.result = response.data;
        console.log('1 Back from upload with data:',response.data);
        // filename in localhost:
        filename = response.data.file.path + "/" + response.data.file.originalname;
        // updated filename that works with aws
        // filename = response.data.file.location;
        dialogCtrl.photoURL = filename;
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
