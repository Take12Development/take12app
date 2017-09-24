take12App.controller('DialogController', ['$scope','$timeout', '$mdDialog', 'Upload', 'photoURL',
                    function($scope, $timeout, $mdDialog, Upload, photoURL) {

  // Dialog Controller for photo upload in dashboard

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
      // saves filename to use when saving registry
      filename = response.data.secure_url;
      dialogCtrl.photoURL = filename;
      $timeout(function () {
        file.result = response.data;
        // saves filename to use when saving registry
        filename = response.data.secure_url;
        dialogCtrl.photoURL = filename;
      });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      }, function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    };

}]);
