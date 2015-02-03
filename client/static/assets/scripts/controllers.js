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

    // Nodes key in building the Project form
    var planTemplate;
    var stepTemplate;
    var planClone;
    var stepClone;

    var containerToolPlansContainer; // Node to hold plans for the project

    // Get nodes important to front-end functionality
    function collectImportantNodes() {
      containerToolPlansContainer = jQuery('.container-tool-plans').get(0);
      planTemplate = jQuery('.plan-template').get(0);
      stepTemplate = jQuery('.step-template').get(0);

      planClone = planTemplate.cloneNode(true);
      stepClone = stepTemplate.cloneNode(true);
    };

    // Add a clone of the plan form to the project, focus on first input
    function addPlanToProject(isPrepopulate) {
      var newPlanNode = planClone.cloneNode(true);
      containerToolPlansContainer.appendChild(newPlanNode);
      jQuery(newPlanNode).find('.plan-num').text(jQuery('.plan-template').length);

      // FYI:  Cannot return node in all cases because Angular throws error 
      if(isPrepopulate) {
        return newPlanNode;
      }
      else {
        focusFirst(newPlanNode);
      }
    }
    $scope.addPlanToProject = addPlanToProject;

    // Add a clone of the container form to the plan
    function addStepToPlan(parent) {
      var newStepNode = stepClone.cloneNode(true);

      parent.insertBefore(newStepNode, jQuery(parent).find('.test-add-step').get(0));
      jQuery(newStepNode).find('.step-num').text(jQuery(parent).find('.step-template').length);
      focusFirst(newStepNode);
    };

    // Focuses on the first element in a block
    function focusFirst(parent) {
      jQuery(parent).find(':input').get(0).focus();
    }

    // Populates form elements in a container based on an object
    function populateFormElements(container, data) {
      jQuery.each(data, function(key, value) {
        jQuery(container).find('[name=' + key + ']').val(value);
      });
    }

    // Runs upon submission of form; should generate JSON and send to DB
    function containerFormSubmit() {
      // Serializes elements to a key=>value object
      var convertElementsToObject = function($inputs, obj) {
        $inputs = $inputs.serializeArray();
        obj = obj || {};
        
        jQuery.each($inputs, function() {
          obj[this.name] = this.value || '';
        });
        return obj;
      };

      // Step 1:  Grab the Project information
      var data = convertElementsToObject(jQuery('.project-table :input'));
      data.plans = [];

      // Step 2.1:  Grab the Plans
      jQuery('.plan-template').each(function() {
        // Get just the *plan* info, *not* the steps yet
        var planItem = convertElementsToObject(jQuery(this).find('.plan-table :input'));

        // Now, get the steps
        planItem.steps = [];
        jQuery(this).find('.step-template').each(function() {
          var stepItem = convertElementsToObject(jQuery(this).find(':input'));
          planItem.steps.push(stepItem);
        });

        data.plans.push(planItem);
      });

      // Finally, focus on the generated code
      var json = JSON.stringify(data);
      var textarea = jQuery('#container-tool-textarea').val(json).get(0);
      textarea.focus();
      textarea.select();

      return false;
    }

    // Prepopluates data to the form
    $scope.prepopulate = function() {
      // Stub data
      var data = {"plans":[{"steps":[{"step_name":"Plan 1 Name","instance_count":"1","run_max_time":"1","run_delay":"1","step_url":"","environment_data":"1 Environment Data","dns_mapping":"DNS 1","port_mapping":"Port 1","volume_mapping":"Volume 1","docker_series":"Docker 1"}],"plan_title":"Plan 1 Title","plan_description":"Plan 1 Description"},{"steps":[{"step_name":"Plan 2","instance_count":"22","run_max_time":"22","run_delay":"22","step_url":"","environment_data":"Data 2","dns_mapping":"DNS 2","port_mapping":"Port 2","volume_mapping":"Volumne 2","docker_series":"Docer 2"}],"plan_title":"Plan 2","plan_description":"Description 2"}],"project_title":"P Title"}

      // Setup the project
      jQuery('#project_title').val(data.project_title);

      // Create the plans and steps, populate them
      jQuery.each(data.plans, function(i) {
        var planNode = (i ? addPlanToProject(true) : planTemplate);
        populateFormElements(planNode, this);

        jQuery.each(this.steps, function(ii) {
          var stepNode = (ii ? addStepToPlan(planNode) : jQuery(planNode).find('.step-template').get(0));
          populateFormElements(stepNode, this);
        });
      });

    };



    // Initialization
    collectImportantNodes();
    var $form = jQuery('.test-form');
    $form.find('input').get(0).focus();
    $form.on('click', '.test-add-step', function(e) {
      addStepToPlan(this.parentNode);
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
