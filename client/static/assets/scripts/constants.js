'use strict';

angular.module('LoadsApp')
  .constant('ROUTES', {
    HOME: '/#/',
    CLUSTER: '/#/cluster',
    AGENTS_STATUS: '/#/agents/status',
    AGENTS_CHECK: '/#/agents/check',
    TESTS: '/#/tests',
    RUNS: '/#/runs',
    RUNS_ACTIVE: '/#/runs/active',
    RUNS_FINISHED: '/#/runs/finished',
    RUN_DETAIL: '/#/run',
    REFERENCE: '/#/reference'
  })
  .constant('WEBSOCKET_URL', 'wss://loads.services.mozilla.com/status/websocket')
  .constant('YEAR', new Date().getFullYear());
