take12App.factory('UtilitiesService', ['$mdDialog', function($mdDialog){


  showAlert = function(message) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(message)
          .ariaLabel(message)
          .ok('Ok')
      );
  };

return {
    showAlert: showAlert
};

}]);//end of UtilitiesService
