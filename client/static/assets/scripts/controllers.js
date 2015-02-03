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

    var planTemplate;
    var stepTemplate;
    var planClone;
    var stepClone;

    var containerToolPlansContainer; // Node to hold strategies for the project

    // Get nodes important to front-end functionality
    function collectImportantNodes() {
      containerToolPlansContainer = $('.container-tool-plans').get(0);
      planTemplate = $('.plan-template').get(0);
      stepTemplate = $('.step-template').get(0);

      planClone = planTemplate.cloneNode(true);
      stepClone = stepTemplate.cloneNode(true);
    };

    // Add a clone of the strategy form to the project, focus on first input
    $scope.addPlanToProject = function() {
      var newPlanNode = planClone.cloneNode(true);
      containerToolPlansContainer.appendChild(newPlanNode);
      jQuery(newPlanNode).find('.plan-num').text(jQuery('.plan-template').length);
      focusFirst(newPlanNode);
    };

    // Add a clone of the container form to the strategy
    function addStepToPlan(button) {
      var newStepNode = stepClone.cloneNode(true);
      var parent = button.parentNode;

      parent.insertBefore(newStepNode, button);
      jQuery(newStepNode).find('.step-num').text(jQuery(parent).find('.step-template').length);
      focusFirst(newStepNode);
    };

    // Focuses on the first element in a block
    function focusFirst(parent) {
      jQuery(parent).find(':input').get(0).focus();
    }

    // Runs upon submission of form; should generate JSON and send to DB
    function containerFormSubmit() {
      // Create the object which will store all data
      var data = {
        strategies: []
      };
      var convertElementsToObject = function($inputs, obj) {
        $inputs = $inputs.serializeArray();
        jQuery.each($inputs, function() {
          obj[this.name] = this.value || "";
        });
      };

      // Step 1:  Grab the Project information
      convertElementsToObject(jQuery('.project-table :input'), data);

      // Step 2.1:  Grab the Strategies
      jQuery('.plan-template').each(function() {
        var strategyItem = {
          containers: []
        };

        // Get just the *strategy* info, *not* the containers yet
        convertElementsToObject(jQuery(this).find('.plan-table :input'), strategyItem);

        // Now, get the containers
        jQuery(this).find('.step-template').each(function() {
          var containerItem = {};

          convertElementsToObject(jQuery(this).find(':input'), containerItem);

          strategyItem.containers.push(containerItem);
        });

        data.strategies.push(strategyItem);
      });

      // Finally, focus on the generated code
      var textarea = $('#container-tool-textarea').val(JSON.stringify(data)).get(0);
      textarea.focus();
      textarea.select();

      return false;
    }

    // Initialization
    collectImportantNodes();
    var $form = jQuery('.test-form');
    $form.find('input').get(0).focus();
    $form.on('click', '.test-add-step', function(e) {
      addStepToPlan(this);
    });
    $form.on('submit', function(e) {
      e.preventDefault();
      containerFormSubmit();
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
