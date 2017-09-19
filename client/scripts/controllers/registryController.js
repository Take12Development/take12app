take12App.controller('RegistryController', ['$scope', '$http', '$routeParams',
                      '$window', '$timeout', 'Upload', 'UserService',
                      'UtilitiesService', 'RegistryDataService',
                    function($scope, $http, $routeParams, $window, $timeout, Upload,
                    UserService, UtilitiesService, RegistryDataService) {

  console.log('params is:', $routeParams.registryUrl);

  $scope.validRegistry = true;
  // Chart values
  var numWeeksProvided = 0;
  var numWeeksGifted = 0;
  var numWeeksNeeded = 12 - numWeeksProvided - numWeeksGifted;
  var chartTooltipData = [];
  $scope.oneDayAmount = 0;
  $scope.oneWeekAmount = 0;

  // Calls Factory function that gets registry information from the database
  RegistryDataService.getRegistry($routeParams.registryUrl).then(function(data){

    console.log('back from server with:', data);
    if (data.data != "") {
      $scope.validRegistry = true;
      $scope.currentRegistry = data.data;
      $scope.currentRegistry.firstName = UtilitiesService.titleCase($scope.currentRegistry.firstName);
      $scope.currentRegistry.lastName = UtilitiesService.titleCase($scope.currentRegistry.lastName);
      $scope.fullURL = REGISTRY_URL + $scope.currentRegistry.registryURL;
      $scope.numberOfComments = $scope.currentRegistry.comments.length;
      console.log('$scope.currentRegistry',$scope.currentRegistry);

      calculateChartValues();

      // PIE Chart
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
	                  display: true,
                    position: 'bottom',
                    labels: {
                      // fontColor: 'rgb(255, 99, 132)'
                    }
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


    } else {
      $scope.validRegistry = false;
    }
    console.log('Valid Registry?', $scope.validRegistry);
  })
  .catch(function(response){
      console.log(response.status);
  });

  // Slider
  $scope.slider = {
    minValue: 20,
    options: {
      floor: 0,
      ceil: 2000,
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
        numWeeksProvided = $scope.currentRegistry.paidWeeks * $scope.currentRegistry.paidWeeksPercentage / 100;
      }
    } else {
      // user entered number of paid weeks and goal amount
      if ($scope.currentRegistry.paidWeeks) {
        numWeeksProvided = $scope.currentRegistry.paidWeeks;
      }
    }

    // calculate amount to cover one week of maternity leave:
    $scope.oneWeekAmount = Math.round($scope.currentRegistry.goalAmount /
                        (12 - numWeeksProvided));
    console.log('oneWeekAmount', $scope.oneWeekAmount);
    // calculate number of weeks gifted based on amount being gifted
    if ($scope.currentRegistry.currentAmount != 0) {
      numWeeksGifted = $scope.oneWeekAmount / $scope.currentRegistry.currentAmount;
    } else {
      numWeeksGifted = 0;
    }
    console.log('numWeeksGifted',numWeeksGifted);
    // calculate number of weeks needed:
    numWeeksNeeded = 12 - numWeeksProvided - numWeeksGifted;

    // calculate day marker:
    $scope.oneDayAmount = Math.round($scope.oneWeekAmount / 5);
    console.log('oneDayAmount',$scope.oneDayAmount);

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

}]);
