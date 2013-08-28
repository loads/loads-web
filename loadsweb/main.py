import sys
import os
from json import dumps

import bottle
from bottle import (route, SimpleTemplate, request,
                    app as _app, TEMPLATE_PATH, static_file,
                    abort, redirect)

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketHandler, WebSocketError

from loadsweb.controller import Controller, TimeoutError


_TMPL = os.path.join(os.path.dirname(__file__), 'templates')
_MEDIA = os.path.join(os.path.dirname(__file__), 'media')

TEMPLATE_PATH.append(_TMPL)


def render(name, **options):
    with open(os.path.join(_TMPL, name + '.tmpl')) as f:

        return SimpleTemplate(f.read(), lookup=[_TMPL]).render(**options)


@route('/')
def handle_index():

    if not app.controller.ping_db():
        # the DB is down.
        # XXX status code ?
        # XXX redirect w/
        app.controller.reconnect()
        return render('error', message='The DB seems down')

    try:
        info = app.controller.get_broker_info()
    except TimeoutError:
        # the broker is down.
        # XXX status code ?
        # XXX redirect w/
        app.controller.reconnect()
        return render('error', message='The Broker seems down')

    def _dated(run_id):
        info = app.controller.get_run_info(run_id)
        started = info['metadata'].get('started', 0)
        fqn = info['metadata']['fqn']
        return started, fqn, run_id

    runs = [_dated(run) for run in app.controller.get_runs(active=True)]
    runs.sort()

    inactives = [_dated(run) for run in app.controller.get_runs(stopped=True)]
    inactives.sort()
    inactives.reverse()

    return render('index', runs=runs, inactives=inactives,
                  controller=app.controller, broker_info=info)


@route('/run/<run_id>')
def handle_run(run_id=None):
    info = app.controller.get_run_info(run_id)

    return render('run', run_id=run_id,
                  info=info, active=info['metadata'].get('active', False),
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
            del info['data']
            wsock.send(dumps(info))
            gevent.sleep(1.)
        except WebSocketError:
            break

@route('/run/<run_id>/stop')
def handle_stop(run_id=None):
    app.controller.stop(run_id)
    redirect('/run/%s' % run_id)


@route('/media/<filename>')
def handle_media(filename):
    return static_file(filename, root=_MEDIA)


app = _app()
# options to push in  a config file XXX
app.db = 'redis'
app.dboptions = {}
app.wsserver = 'localhost'
app.wsport = 8080
app.broker = 'ipc:///tmp/loads-front.ipc'
app.controller = Controller(db=app.db, dboptions=app.dboptions,
                            broker=app.broker)

bottle.debug(True)


def main():
    server = WSGIServer(("0.0.0.0", 8080), app,
                        handler_class=WebSocketHandler)
    return server.serve_forever()


if __name__ == '__main__':
    sys.exit(main())
