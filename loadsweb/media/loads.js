function isInArray(value, array) {
  return array.indexOf(value) > -1 ? true : false;
}
var counters = [];
var tmpl = '<div id=\'error-{{hashed}}\'>' + '<strong><span id=\'error-{{hashed}}-count\'>{{count}}</span> occurrences:</strong>' + '<pre>{{tb}}</pre>' + '</div>';
var template = Handlebars.compile(tmpl);
var run_tmpl = '<div id=\'run-{{run_id}}\'>' +
               '<a href=\'/run/{{run_id}}\'><span class="status yellow"></span>{{fqn}}</a>' +
               '</div>';
var run_template = Handlebars.compile(run_tmpl);

var inactive_tmpl = '<dt id=\'inactive-{{run_id}}\'>{{run_id}}</dt>' + '<dd id=\'inactive-{{run_id}}-link\'><a href=\'/run/{{run_id}}\'>{{started}}: {{fqn}}</a></dd>';

var  inactive_tmpl = '<tr id="inactive-{{run_id}}" class="{{style}}">' +
    '<td><a href="/run/{{run_id}}"><span class="status {{style}}"></span>{{fqn}}</a></td>' +
    '<td>{{elapsed}}</td>' +
    '<td>{{finished}} ago</td>' +
  '</tr>';

var inactive_template = Handlebars.compile(inactive_tmpl);


function initStatusSocket(url) {
  try {
    var status_socket = new WebSocket(url);
    status_socket.onmessage = function (msg) {
      var obj = JSON.parse(msg.data);
      // hide or show the norun span
      if (obj.active.length > 0) {
        $('#norun').hide();
      } else {
        $('#norun').show();
      }
      $.each(obj.active, function (key, value) {
        key += 1;
        var _run_id = '#run-' + value[2];
        if (!$(_run_id).length) {
          // we need to add a new run
          var context = {
              index: key,
              started: value[0],
              fqn: value[1],
              run_id: value[2]
            };
          var html = run_template(context);
          $('#active-title').after(html);
        }
      });
      $.each(obj.inactive, function (key, value) {
        var _run_id = '#run-' + value[2];
        var inactive_id = '#inactive-' + value[2];
        key += 1;
        // let's remove the run if it exists in active
        if ($(_run_id).length) {
          $(_run_id).remove();
          $('#run-' + value[2] + '-link').remove();
        }
        // let's add it to the inactive list if not present
        if (!$(inactive_id).length) {
          if (value[1] == 'loads.examples.test_blog.TestWebSite.test_health') {
              var fqn = 'Health Check';
          } else {
              var fqn = value[1];
          }


          // we need to add a new run
          var context = {
              index: key,
              started: value[0],
              fqn: fqn,
              run_id: value[2],
              elapsed: value[3].counts.elapsed,
              finished: value[3].counts.finished,
              style: value[3].metadata.style
            };
          var html = inactive_template(context);
          $('#stored').prepend(html);
        }
      });
    };
  } catch (exception) {
    console.log(exception);
  }
}
function initRunSocket(url) {
  try {
    var socket = new WebSocket(url);
    socket.onmessage = function (msg) {
      var obj = JSON.parse(msg.data);
      if (obj.metadata.active) {
        $('state').text('Running');
      } else {
        $('#state').text('Ended');
        socket.close();
        $('#spinner').hide();
        $('#stop').hide();
        return;
      }
      $.each(obj.counts, function (key, value) {
        var count_id = '#count-' + key;
        if ($(count_id).length) {
          $(count_id).text(value);
        } else {
        }
      });
      $.each(obj.errors, function (key, value) {
        var md5 = value[0];
        var _count = value[1][0];
        var _tb = value[1][1];
        var hash = '#error-' + md5;
        var hash_count = hash + '-count';
        if ($(hash).length) {
          // set the count
          $(hash_count).text(_count);
        } else {
          /* todo: add the error div*/
          var context = {
              hashed: md5,
              count: _count,
              tb: _tb
            };
          var html = template(context);
          $('#errors').append(html);
        }
      });
      $.each(obj.custom, function (key, value) {
        var count_id = '#count-' + key;
        if ($(count_id).length) {
          $(count_id).text(value);
        } else {
        }
      });
    };
  } catch (exception) {
    console.log(exception);
  }
}
function initSpinner(spinnerId) {
  var opts = {
      lines: 10,
      angle: 0,
      lineWidth: 0.44,
      pointer: {
        length: 0.9,
        strokeWidth: 0.035,
        color: '#000000'
      },
      limitMax: 'false',
      colorStart: '#6FADCF',
      colorStop: '#8FC0DA',
      strokeColor: '#E0E0E0',
      generateGradient: true
    };
  var opts = {
      lines: 15,
      length: 10,
      width: 3,
      radius: 10,
      corners: 1,
      rotate: 0,
      direction: 1,
      color: '#000',
      speed: 1,
      trail: 60,
      shadow: false,
      hwaccel: false,
      className: 'spinner',
      zIndex: 2000000000,
      top: 'auto',
      left: 'auto'
    };
  var target = document.getElementById(spinnerId);
  var spinner = new Spinner(opts).spin(target);
}