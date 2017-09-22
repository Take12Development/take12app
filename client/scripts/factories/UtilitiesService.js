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

  // list of states
   var states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
      'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
      'WY').split(' ').map(function(state) {
          return {abbrev: state};
  });

  // Redirects to view received as a parameter
  function redirect(page) {
    $location.url(page);
  }

  // redirects to homepage
  function goHome() {
    var home = location.host;
    $location.url(home);
  };

  // Function that checks if an object is empty
  function isObjectEmpty(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }
      return true;
  }

return {
    showAlert: showAlert,
    redirect : redirect,
    goHome : goHome,
    titleCase : titleCase,
    states: states,
    isObjectEmpty : isObjectEmpty
};

}]);
