take12App.factory('StripeService', ['$http',
                  function($http){

  // Creates Stripe Account
  function createAccount(registry) {
    $http.post('/stripe/newaccount', registry).then(function(response) {
      console.log('Back from the server with:', response);
    });
  }

return {
    createAccount: createAccount
};

}]);
