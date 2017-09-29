take12App.controller('RegistryController', ['$scope', '$http', '$routeParams',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  $scope.validRegistry = true;
  RegistryDataService.registriesObject.currentViewedRegistry = {};
  // Chart values
  var numWeeksProvided = 0;
  var numWeeksGifted = 0;
  var numWeeksNeeded = 12 - numWeeksProvided - numWeeksGifted;
  $scope.numDaysGifted = 0;
  var chartTooltipData = [];
  $scope.oneDayAmount = 0;
  $scope.oneWeekAmount = 0;
  var homeUrl = 'https://' + location.host + '/#/registry/';

  // Calls Factory function that gets registry information from the database
  RegistryDataService.getRegistry($routeParams.registryUrl).then(function(data){

    if (data.data != "") {
      $scope.validRegistry = true;
      $scope.currentRegistry = data.data;
      $scope.currentRegistry.firstName = UtilitiesService.titleCase($scope.currentRegistry.firstName);
      $scope.currentRegistry.lastName = UtilitiesService.titleCase($scope.currentRegistry.lastName);
      $scope.fullURL = homeUrl + $scope.currentRegistry.registryURL;
      $scope.numberOfComments = $scope.currentRegistry.comments.length;

      calculateChartValues();

      // PIE CHART
      // Tooltips customization:
      Chart.defaults.global.tooltips.custom = function(tooltip) {
      	// Tooltip Element
      	var tooltipEl = document.getElementById('chartjs-tooltip');
    		// Hide if no tooltip
    		if (tooltip.opacity === 0) {
    			tooltipEl.style.opacity = 0;
    			return;
    		}
    		// Set caret Position
    		tooltipEl.classList.remove('above', 'below', 'no-transform');
    		if (tooltip.yAlign) {
    			tooltipEl.classList.add(tooltip.yAlign);
    		} else {
    			tooltipEl.classList.add('no-transform');
    		}
    		function getBody(bodyItem) {
    			return bodyItem.lines;
    		}
    		// Set Text
    		if (tooltip.body) {
    			var titleLines = tooltip.title || [];
    			var bodyLines = tooltip.body.map(getBody);
    			var innerHtml = '<thead>';
    			titleLines.forEach(function(title) {
    				innerHtml += '<tr><th>' + title + '</th></tr>';
    			});
    			innerHtml += '</thead><tbody>';
    			bodyLines.forEach(function(body, i) {
    				var colors = tooltip.labelColors[i];
    				var style = 'background:' + colors.backgroundColor;
    				style += '; border-color:' + colors.borderColor;
    				style += '; border-width: 2px';
            style += '; font-family: sans-serif';
    				var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
    				innerHtml += '<tr><td>' + span + body + '</td></tr>';
    			});
    			innerHtml += '</tbody>';
    			var tableRoot = tooltipEl.querySelector('table');
    			tableRoot.innerHTML = innerHtml;
    		}
    		var positionY = this._chart.canvas.offsetTop;
    		var positionX = this._chart.canvas.offsetLeft;
    		// Display, position, and set styles for font
    		tooltipEl.style.opacity = 1;
    		tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    		tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    		tooltipEl.style.fontFamily = "Lato', sans-serif";
    		tooltipEl.style.fontSize = tooltip.fontSize;
    		tooltipEl.style.fontStyle = tooltip._fontStyle;
    		tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
    	};

      var ctx = "myChart";
      var myStaticChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ["Maternity Leave Needed (weeks)", "Maternity Leave Provided (weeks)",
                  "Maternity Leave Gifted (weeks)"],
          datasets: [{
            backgroundColor: [
              "#dedede",
              "#6acbc4",
              "#f7aca0"
            ],
            hoverBackgroundColor: [
                "#dedede",
                "#6acbc4",
                "#f7aca0"
            ],
            data: [numWeeksNeeded, numWeeksProvided, numWeeksGifted]
          }]
        },
        options: {
		      responsive: true,
		      legend: {
            display: false,
            position: 'bottom'
          },
          tooltips: {
            enabled: false,
            mode: 'single',
            callbacks: {
              afterTitle: function(data) {
                var tooltipAdditionalText = chartTooltipData[data[0].index];
                var multistringText = [];
                multistringText.push(tooltipAdditionalText);
                return multistringText;
              }
            }
          }
	      }
      }); // End of Pie Chart
    } else { //if (data.data != "")
      $scope.validRegistry = false;
    }
  })
  .catch(function(response){
      console.log(response.status);
  });

  // Slider
  $scope.slider = {
    minValue: 20,
    options: {
      floor: 0,
      ceil: 500,
      step: 20,
      // ticksArray: [{value:13, legend:"1d"}, {value:67 ,legend:"1w"}],
      showTicks: false,
      hidePointerLabels: true,
    }
  }; // End of Slider

  // calculate values for pie chart based on user entries
  function calculateChartValues() {
    // get number of weeks provided by employer
    if ($scope.currentRegistry.goalAmtEntryOpt == '1') {
      // user entered net income, paid weeks and percentage
      if ($scope.currentRegistry.paidWeeks) {
        numWeeksProvided = Math.round(($scope.currentRegistry.paidWeeks * $scope.currentRegistry.paidWeeksPercentage / 100) *10) / 10 ;
      }
    } else {
      // user entered number of paid weeks and goal amount
      if ($scope.currentRegistry.paidWeeks) {
        numWeeksProvided = $scope.currentRegistry.paidWeeks;
      }
    }
    // calculate amount to cover one week of maternity leave (week marker)
    $scope.oneWeekAmount = Math.round($scope.currentRegistry.goalAmount /
                        (12 - numWeeksProvided));
    // calculate amount to cover one day of maternity leave (day marker)
    $scope.oneDayAmount = Math.round($scope.oneWeekAmount / 5);
    // calculate number of weeks gifted based on amount gifted
    if ($scope.currentRegistry.currentAmount != 0) {
      numWeeksGifted = Math.round(($scope.currentRegistry.currentAmount / $scope.oneWeekAmount) *10) / 10;
      // Calculate how many days have been gifted
      $scope.numDaysGifted = Math.round($scope.currentRegistry.currentAmount/$scope.oneDayAmount);
    } else {
      numWeeksGifted = 0;
      $scope.numDaysGifted = 0;
    }
    // calculate number of weeks needed:
    numWeeksNeeded = 12 - numWeeksProvided - numWeeksGifted;
    // build array of data to display in chart tooltips
    var amount = 0;
    var tooltipText = '';
    // get amount needed:
    amount = Math.round($scope.currentRegistry.goalAmount - $scope.currentRegistry.currentAmount);
    tooltipText = 'Amount needed: $' + amount.toString();
    chartTooltipData.push(tooltipText);
    // get amount provided:
    amount = Math.round($scope.oneWeekAmount * numWeeksProvided);
    tooltipText = 'Amount provided: $' + amount.toString();
    chartTooltipData.push(tooltipText);
    // get amount gifted:
    amount = Math.round($scope.currentRegistry.currentAmount);
    tooltipText = 'Amount gifted: $' + amount.toString();
    chartTooltipData.push(tooltipText);
  }

  $scope.goToCheckout = function() {
    // add gift information to $scope.currentRegistry
    $scope.currentRegistry.gift = $scope.slider.minValue;
    // save information of current viewed registry in Factory
    RegistryDataService.registriesObject.currentViewedRegistry = $scope.currentRegistry;
    UtilitiesService.redirect('/checkout');
  }

}]);
