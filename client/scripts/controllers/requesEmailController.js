take12App.controller('RequestEmailController', ['$scope', '$http', 'UserService', 'UtilitiesService',
                      'RegistryDataService',
                      function($scope, $http, UserService, UtilitiesService, RegistryDataService) {

  $scope.userObject = UserService.userObject;
  $scope.logout = UserService.logout;
  $scope.redirect = UtilitiesService.redirect;
  $scope.fbuser = {};

  $scope.submitEmail = function() {
    $scope.fbuser.facebookId = $scope.userObject.facebookId;
    console.log('parameter to send:',$scope.fbuser);
    // update facebook user with email address
    UserService.updateFBUserEmail($scope.fbuser).then(function(data){
      if (data.data != "") {
        UserService.userObject.email = data.data.email;
        console.log('* Data in request email',data);
        console.log('* UserService.userObject.email',UserService.userObject.email);
        // checks if there is a unclaimed registry for this user
        $http.get('/registry/unclaimed/' + UserService.userObject.email).then(function(res) {
          if(res.data) {
            console.log('** res.data',res.data);
            if(res.data.registries.length > 0) {
              // a registry has been created for this user
              console.log('A REGISTRY HAS BEEN CREATED FOR THIS USER');
              UserService.userObject.registriesToClaim = res.data.registries;
              UtilitiesService.redirect('/claimregistries');
            } else {
              if(UserService.userObject.registries.length != 0) {
                // Existing user: Presents registry dashboard
                UtilitiesService.redirect('/main');
              } else {
                // New user: Presents registration views
                UtilitiesService.redirect('/registration');
              }
            }
          } else {
            console.log('*** UserService.userObject', UserService.userObject);
            if(UserService.userObject.registries.length != 0) {
              // Existing user: Presents registry dashboard
              UtilitiesService.redirect('/main');
            } else {
              // New user: Presents registration views
              UtilitiesService.redirect('/registration');
            }
          }
        });
      } else { //if (data.data != "")
        UtilitiesService.showAlert('There was a problem updating your account');
      }
    })
    .catch(function(response){
        console.log(response.status);
    });
  };


}]);
