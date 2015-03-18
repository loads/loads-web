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
  }).controller('ProjectsController', function($scope, $rootScope) {
    $rootScope.title = 'Projects';

    var $textarea = jQuery('.gist-json');
    var notify = function(messages) {
      if(window.Notification && Notification.permission !== 'denied') {
        Notification.requestPermission(function(status) {
          jQuery.each(messages, function(i, value) {
            new Notification('Validation Result', {
              body: value
            });
          });
        });
      }
      else {
        alert(messages.join('\n'));
      }
    };

    jQuery('.validateBtn').on('click', function (e) {
      e.preventDefault();
      var data = $textarea.val();
      var $this = jQuery(this);
      var originalText = $this.text();
      $this.prop('disabled', true).text('Validating...');

      jQuery.post('/api/schema/validate', {
        data: data
      }, function (resp) {
        var messages = [];

        $this.prop('disabled', false).text(originalText);

        if (resp.success) {
          messages.push('Success!');
        } else {
          // NOTE: `resp.details.length` always seems to be 1.
          resp.details.forEach(function (result) {
            messages.push(result.message);
          });
        }

        notify(messages);
      });
    });

    jQuery('#gist-form').on('submit', function(e) {
      e.preventDefault();

      var gistId = jQuery('#gist').val();
      var $resultDestination = jQuery('.result-destination');

      $resultDestination.removeClass('error').removeClass('valid');
      jQuery.getJSON('/api/gist/' + gistId).done(function(data) {
        var content;
        if (data.success) {
          content = data.files[0].content;
          $textarea.val(JSON.stringify(content, null, 2)).get(0).select();
          jQuery('.gist-avatar').attr('src', data.owner.avatar_url);
          jQuery('.gist-username').html(data.owner.login);
          jQuery('.gist-description').html(data.description);

          $resultDestination.addClass('valid');
        } else { // Error
          jQuery('.invalid-info').html(data.message);
          $resultDestination.addClass('error');
        }
      });
    });
  }).controller('ProjectBuilderController', function ($scope, $rootScope, $routeParams, $http) {
    $rootScope.title = 'Project Builder';

    // Nodes key in building the Project form
    var planTemplate;
    var stepTemplate;
    var planClone;
    var stepClone;

    var projectToolPlansContainer; // Node to hold plans for the project
    var projectJSON;

    // Get nodes important to front-end functionality
    function collectImportantNodes() {
      projectToolPlansContainer = jQuery('.project-tool-plans').get(0);
      planTemplate = jQuery('.plan-template').get(0);
      stepTemplate = jQuery('.step-template').get(0);

      planClone = planTemplate.cloneNode(true);
      stepClone = stepTemplate.cloneNode(true);
    }

    // Add a clone of the plan form to the project, focus on first input
    function addPlanToProject(isPrepopulate) {
      var newPlanNode = planClone.cloneNode(true);
      projectToolPlansContainer.appendChild(newPlanNode);
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
    }

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
    function generateJSON() {
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
      projectJSON = data;
      var textarea = jQuery('#project-tool-textarea').val(JSON.stringify(data, null, 2)).get(0);
      textarea.focus();
      textarea.select();

      return false;
    }

    // Prepopluates data to the form
    function prepopulate(data) {
      // Setup the project
      jQuery('#project_id').val(data.project_id);
      jQuery('#project_title').val(data.project_title);

      console.log('data.project_id', data.project_id);

      // Create the plans and steps, populate them
      jQuery.each(data.plans, function(i) {
        var planNode = (i ? addPlanToProject(true) : planTemplate);
        populateFormElements(planNode, this);

        jQuery.each(this.steps, function(ii) {
          var stepNode = (ii ? addStepToPlan(planNode) : jQuery(planNode).find('.step-template').get(0));
          populateFormElements(stepNode, this);
        });
      });
    }

    // Save this project, either as new or edit
    $scope.saveProject = function() {
      // Send to server, redirect to projects listing
      generateJSON();
      $http.post('/mock/project', projectJSON).success(function (data) {
        console.log('bling!');
      }).error(function (err) {
        console.error(err);
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
      generateJSON();
    });

    // Pre-populate the form if a record is loaded...
    var recordId = $routeParams.id;
    if(recordId) {
      // Retrieve the record...
      $http.get('/mock/project/' + recordId).success(function(data){
        prepopulate(data);
      });
    }

  }).controller('RunsController', function ($scope, $rootScope, RunsService) {
    $rootScope.title = 'Runs';
  }).controller('ActiveRunsController', function ($scope, $rootScope, RunsService) {
    $rootScope.title = 'Active Runs';
  }).controller('FinishedRunsController', function ($scope, $rootScope, RunsService) {
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
        console.error(err);
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
