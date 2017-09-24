take12App.controller('CheckoutController', ['$scope', '$http',
                      '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

$scope.currentViewedRegistry = RegistryDataService.registriesObject.currentViewedRegistry;

// Checks if currentViewedRegistry exists, if not redirects to findRegistry view
if (UtilitiesService.isObjectEmpty($scope.currentViewedRegistry)) {
  UtilitiesService.redirect('/findRegistry');
} else {
  $scope.gift = $scope.currentViewedRegistry.gift;
  var registryAccount = $scope.currentViewedRegistry._id;
  var registryEmail = $scope.currentViewedRegistry.email;
}

var stripe = Stripe(STRIPE_PUBLIC);
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    lineHeight: '24px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      stripeTokenHandler(result.token);
    }
  });
});

function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'registryAccount');
  hiddenInput.setAttribute('value', registryAccount);
  form.appendChild(hiddenInput);

  hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'registryEmail');
  hiddenInput.setAttribute('value', registryEmail);
  form.appendChild(hiddenInput);

  form.submit();
}


}]);
