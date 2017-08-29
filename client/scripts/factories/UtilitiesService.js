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

  titleCase = function (stringParam) {
    return stringParam.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };

  // Redirects to view received as a parameter
  function redirect(page) {
    $location.url(page);
  }

return {
    showAlert: showAlert,
    redirect : redirect,
    titleCase : titleCase
};

}]);
