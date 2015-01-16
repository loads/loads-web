'use strict';

angular.module('LoadsApp')
  .directive('headerNav', partial(true, 'E', 'header-nav'))
  .directive('footerNav', partial(true, 'E', 'footer-nav'))
  .directive('activeRuns', partial(false, 'E', 'runs-active-table'))
  .directive('finishedRuns', partial(false, 'E', 'runs-finished-table'))
  .directive('runsHead', partial(false, 'A', 'runs-head'))
  .directive('runsBody', partial(false, 'A', 'runs-body'))
  .directive('commentList', partial(true, 'E', 'comment-list'))
  .directive('commentForm', partial(true, 'E', 'comment-form'));

function partial(replace, restrict, templateUrl) {
  return function () {
    return {
      replace: replace,
      restrict: restrict,
      templateUrl: 'assets/views/_partials/' + templateUrl + '.html'
    };
  };
}
