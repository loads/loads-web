function initSocket(url) {
  
  try {
    var socket = new WebSocket(url);

    socket.onmessage = function(msg) {
      var obj = JSON.parse(msg.data);
      $.each(obj, function(key, value) {
        var count_id = '#count-' + key;
        if ($(count_id).length) {
          $(count_id).text(value);
        } else {
          // TODO: add a new widget on the fly!
        }
      });
    };
  }
  catch(exception) {
    console.log(exception);
  }
}

function initSpinner(spinnerId) {
  var opts = {
    lines: 10, // The number of lines to draw
    angle: 0, // The length of each line
    lineWidth: 0.44, // The line thickness
    pointer: {
      length: 0.9, // The radius of the inner circle
       strokeWidth: 0.035, // The rotation offset
      color: '#000000' // Fill color
    },
    limitMax: 'false',   // If true, the pointer will not go past the end of the gauge

    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0',   // to see which ones work best for you
    generateGradient: true
    };

  var opts = {
    lines: 15, // The number of lines to draw
    length: 10, // The length of each line
    width: 3, // The line thickness
    radius: 10, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };

  var target = document.getElementById(spinnerId);
  var spinner = new Spinner(opts).spin(target);
}

