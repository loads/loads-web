$(function () {
  'use strict';

  var currentUser = null;

  $(function() {
    $('#signin').on('click', function () {
      navigator.id.request();
    });
  });

  navigator.id.watch({
    loggedInUser: currentUser,
    onlogin: function(assertion) {
      $.ajax({
        type: 'POST',
        url: '/login',
        data: {
          assertion: assertion
        },
        success: function(res, status, xhr) {
          var success = res.status && (status === 'success');
          console.log('onlogin.success:', success, status, '???', res.status);
          if (success !== undefined) {
            window.location.replace(success ? '/' : '/login');
          }
        },
        error: function(xhr, status, err) {
          console.error(err);
          currentUser = null;
          navigator.id.logout();
        }
      });
    },
    onlogout: function() {
      $.ajax({
        type: 'GET',
        url: '/logout',
        success: function(res, status, xhr) {
          currentUser = null;
          window.location.reload();
        },
        error: function(xhr, status, err) {
          currentUser = null;
        }
      });
    }
  });
});