import sys
import os
from json import dumps

import bottle
from bottle import (route, run, SimpleTemplate, request,
                    app as _app, TEMPLATE_PATH, static_file,
                    abort)

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketHandler, WebSocketError

from loadsweb.controller import Controller


_TMPL = os.path.join(os.path.dirname(__file__), 'templates')
_MEDIA = os.path.join(os.path.dirname(__file__), 'media')

TEMPLATE_PATH.append(_TMPL)


def render(name, **options):
    with open(os.path.join(_TMPL, name + '.tmpl')) as f:

        return SimpleTemplate(f.read(), lookup=[_TMPL]).render(**options)


@route('/')
def handle_index():
    def _dated(run_id):
        info = app.controller.get_run_info(run_id)
        started = info['metadata'].get('started', 0)
        fqn = info['metadata']['fqn']
        return started, fqn, run_id

    runs = [_dated(run) for run in app.controller.get_runs()]
    runs.sort()

    return render('index', runs=runs,
                  controller=app.controller)


@route('/run/<run_id>')
def handle_run(run_id=None):
    return render('run', run_id=run_id,
                  info=app.controller.get_run_info(run_id),
                  controller=app.controller,
                  wsserver=app.wsserver, wsport=app.wsport)


@route('/run/<run_id>/websocket')
def handle_websocket(run_id=None):
    wsock = request.environ.get('wsgi.websocket')
    if not wsock:
        abort(400, 'Expected WebSocket request.')

    while True:
        try:
            info = app.controller.get_run_info(run_id)
            wsock.send(dumps(info['counts']))
            gevent.sleep(1.)
        except WebSocketError:
            break


@route('/media/<filename>')
def handle_media(filename):
    return static_file(filename, root=_MEDIA)


app = _app()
app.controller = Controller()
bottle.debug(True)

# options XXX
app.wsserver = 'localhost'
app.wsport = 8080


def main():
    server = WSGIServer(("0.0.0.0", 8080), app,
                        handler_class=WebSocketHandler)
    return server.serve_forever()


if __name__ == '__main__':
    sys.exit(main())
