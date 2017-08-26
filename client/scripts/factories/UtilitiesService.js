take12App.factory('UtilitiesService', ['$mdDialog', '$location',
                  function($mdDialog, $location){

  // shows alert modal window
  showAlert = function(message) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(message)
          .ariaLabel(message)
          .ok('Ok')
      );
  };

  // Redirects to view received as a parameter
  function redirect(page) {
    $location.url(page);
  }

return {
    showAlert: showAlert,
    redirect : redirect
};

}]);
