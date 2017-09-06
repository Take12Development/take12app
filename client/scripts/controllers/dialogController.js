take12App.controller('DialogController', ['$scope','$timeout', '$mdDialog', 'Upload', 'photoURL',
                    function($scope, $timeout, $mdDialog, Upload, photoURL) {

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

}]);