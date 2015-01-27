'use strict';

angular.module('LoadsApp')
  .controller('AppController', ['$scope', 'ROUTES', 'YEAR', function ($scope, ROUTES, YEAR) {
    $scope.ROUTES = ROUTES;
    $scope.YEAR = YEAR;
    // Unused
  }]).controller('HomeController', function ($scope, $rootScope) {
    $rootScope.title = 'Home';
  }).controller('ClusterManagementController', function ($scope, $rootScope) {
    $rootScope.title = 'Cluster Management';
  }).controller('AgentsStatusController', function ($scope, $rootScope) {
    $rootScope.title = 'Agents Status';
  }).controller('LaunchAgentHealthCheckController', function ($scope, $rootScope) {
    $rootScope.title = 'Launch Agent Health Check';
  }).controller('TestsController', function ($scope, $rootScope) {
    $rootScope.title = 'Containers';

    var strategyTemplate;
    var containerTemplate;
    var strategyClone;
    var containerClone;

    var containerToolStrategiesContainer; // Node to hold strategies for the project

    // Get nodes important to front-end functionality
    function collectImportantNodes() {
      containerToolStrategiesContainer = $('.container-tool-strategies').get(0);
      strategyTemplate = $('.strategy-template').get(0);
      containerTemplate = $('.container-template').get(0);

      strategyClone = strategyTemplate.cloneNode(true);
      containerClone = containerTemplate.cloneNode(true);
    };

    // Add a clone of the strategy form to the project, focus on first input
    $scope.addStrategyToProject = function() {
      var newStrategyNode = strategyClone.cloneNode(true);
      containerToolStrategiesContainer.appendChild(newStrategyNode);
      jQuery(newStrategyNode).find('.strategy-num').text(jQuery('.strategy-template').length);
      focusFirst(newStrategyNode);
    };

    // Add a clone of the container form to the strategy
    function addContainerToStrategy(button) {
      var newContainerNode = containerClone.cloneNode(true);
      var parent = button.parentNode;

      parent.insertBefore(newContainerNode, button);
      jQuery(newContainerNode).find('.container-num').text(jQuery(parent).find('.container-template').length);
      focusFirst(newContainerNode);
    };

    // Focuses on the first element in a block
    function focusFirst(parent) {
      jQuery(parent).find('input').get(0).focus();
    }

    // Runs upon submission of form; should generate JSON and send to DB
    $scope.containerFormSubmit = function() {

    };

    // Get nodes to start
    collectImportantNodes();

    jQuery('.test-form').on('click', '.test-add-container', function() {
      addContainerToStrategy(this);
    });

  }).controller('RunsController', function ($scope, $rootScope, MockRunsService, RunsService) {
    $rootScope.title = 'Runs';
  }).controller('ActiveRunsController', function ($scope, $rootScope, MockRunsService, RunsService) {
    $rootScope.title = 'Active Runs';
  }).controller('FinishedRunsController', function ($scope, $rootScope, MockRunsService, RunsService) {
    $rootScope.title = 'Finished Runs';
  }).controller('RunDetailController', function ($scope, $rootScope, $routeParams, $http) {
    var id = $routeParams.id;
    $rootScope.title = 'Run';
    $scope.params = $routeParams;

    // For use for ng-model binding.
    $scope.runComment = {
      runId: id
    };

    $scope.resetCommentForm = function () {
      delete $scope.runComment.comment;
    };

    $scope.submitCommentForm = function () {
      var data = angular.copy($scope.runComment);
      data.runId = id;
      $http.post('/api/comments/', data).success(function (data) {
        $scope.resetCommentForm();
      }).error(function (err) {
        console.log(err);
      });
    };

    $http.get('/api/comments/runId/' + id).success(function (data) {
      $scope.comments = data;
    });

    $http.get('/assets/run-detail.json').success(function (data) {
      data.status.runId = id;
      // data.status.startTime = new Date(data.status.startTime);
      // data.status.endTime = new Date(data.status.endTime);
      $scope.details = data;
    }).error(function (err) {
      console.error(err);
    });
  }).controller('ReferenceController', function ($scope, $rootScope) {
    $rootScope.title = 'Reference';
  });
