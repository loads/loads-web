'use strict';

angular.module('LoadsApp')
  .directive('headerNav', partial(true, 'E', 'header-nav'))
  .directive('footerNav', partial(true, 'E', 'footer-nav'))
  .directive('activeRuns', partial(false, 'E', 'runs-active-table'))
  .directive('finishedRuns', partial(false, 'E', 'runs-finished-table'))
  .directive('runsHead', partial(false, 'A', 'runs-head'))
  .directive('runsBody', partial(false, 'A', 'runs-body'))
  .directive('commentList', partial(true, 'E', 'comment-list'))
  .directive('commentForm', partial(true, 'E', 'comment-form'))
  .directive('containerStep1', partial(true, 'E', 'container-step-1'))
  .directive('containerStep2', partial(true, 'E', 'container-step-2'))
  .directive('containerStep3', partial(true, 'E', 'container-step-3'));

function partial(replace, restrict, templateUrl) {
  return function () {
    return {
      replace: replace,
      restrict: restrict,
      templateUrl: '/assets/views/_partials/' + templateUrl + '.html'
    };
  };
}
