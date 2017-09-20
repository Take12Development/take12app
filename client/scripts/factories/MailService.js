take12App.factory('MailService', ['$http',
                  function($http){


  function sendMail() {
    $http.post('/email/testmail').then(function(response) {
      console.log('Back from the server with:', response);
    });
  }

return {
    sendMail: sendMail
};

}]);
