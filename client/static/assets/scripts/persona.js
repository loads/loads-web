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
        url: '/login?buster=' + Date.now(),
        data: {
          assertion: assertion
        },
        success: function(res, status, xhr) {
          if (status === 'success' && res.email) {
            if (res.status) {
              currentUser = res.email;
              window.location.replace('/');
            } else {
              alert('Unauthorized'); // eslint-disable-line no-alert
              navigator.id.logout();
            }
          }
        },
        error: function(xhr, status, err) {
          console.error(err); // eslint-disable-line no-console
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
