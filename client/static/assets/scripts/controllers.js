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
      containerToolStrategiesContainer = $('.container-tool-strategies');
      strategyTemplate = $('.strategy-template');
      containerTemplate = $('.container-template');

      strategyClone = strategyTemplate.cloneNode(true);
      containerClone = containerTemplate.cloneNode(true);
    };

    // Add a clone of the strategy form to the project
    $scope.addStrategyToProject = function() {
      var newStrategyNode = strategyClone.cloneNode(true);
      containerToolStrategiesContainer.appendChild(newStrategyNode);
      $('input', newStrategyNode).focus();

    };

    // Add a clone of the container form to the strategy
    $scope.addContainerToStrategy = function() {

    };

    // Runs upon submission of form; should generate JSON and send to DB
    $scope.containerFormSubmit = function() {
      
    };

    // Get nodes to start
    collectImportantNodes();

    function $(selector, parent) { return (parent || document).querySelector(selector); }
    function $$(selector, parent) { return (parent || document).querySelectorAll(selector); }

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
