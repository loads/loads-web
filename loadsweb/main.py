import sys
import os
from json import dumps
import socket
import argparse
from konfig import Config

import bottle
from bottle import (route, SimpleTemplate, request,
                    app as _app, TEMPLATE_PATH, static_file,
                    abort, redirect)

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketHandler, WebSocketError

from loadsweb.controller import Controller
from loads.transport.client import TimeoutError


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

    runs, inactives = _get_runs(size=10)
    return render('index', runs=runs, inactives=inactives,
                  controller=app.controller,
                  broker_info=info,
                  wsserver=app.config['wsserver'],
                  wsport=app.config['wsport'])


def _get_runs(size=10):
    """Returns the last :param size: runs.

    Return a list of active and inactive runs.
    """
    def _dated(run_id):
        info = app.controller.get_run_info(run_id, data=False)
        started = info['metadata'].get('started', 0)
        fqn = info['metadata']['fqn']
        return started, fqn, run_id, info

    runs = [_dated(run) for run in app.controller.get_runs(active=True,
                                                           data=False)]
    runs.sort()

    inactives = [_dated(run) for run in app.controller.get_runs(stopped=True,
                                                                data=False)]
    inactives.sort()
    inactives.reverse()
    return runs[:size], inactives[:size]


@route('/run/<run_id>')
def handle_run(run_id=None):
    info = app.controller.get_run_info(run_id)

    return render('run', run_id=run_id,
                  info=info, active=info['metadata'].get('active', False),
                  controller=app.controller,
                  wsserver=app.config['wsserver'],
                  wsport=app.config['wsport'])


@route('/status/websocket')
def handle_status():
    wsock = request.environ.get('wsgi.websocket')
    if not wsock:
        abort(400, 'Expected WebSocket request.')

    while True:
        try:
            active, inactive = _get_runs()
            status = {'active': active, 'inactive': inactive}
            wsock.send(dumps(status))
            gevent.sleep(5.)
        except (WebSocketError, socket.error):
            break


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
        except (WebSocketError, socket.error):
            break


@route('/run/<run_id>/stop')
def handle_stop(run_id=None):
    app.controller.stop(run_id)
    redirect('/run/%s' % run_id)


@route('/media/<filename>')
def handle_media(filename):
    return static_file(filename, root=_MEDIA)


app = _app()


def main():
    parser = argparse.ArgumentParser(description='Run the Loads Dashboard')
    parser.add_argument('config', help='configuration file', nargs='?')
    args = parser.parse_args()

    # default config
    options = ['db', 'wsserver', 'wsport', 'broker', 'debug', 'host', 'port']
    config = {'db': 'python',
              'dboptions': {},
              'wsserver': 'localhost',
              'wsport': 8080,
              'broker': 'ipc:///tmp/loads-front.ipc',
              'debug': True,
              'host': '0.0.0.0',
              'port': 8080}

    if args.config is not None:
        config_parser = Config(args.config)
        for key, value in config_parser.items('loads'):
            if key not in options:
                continue
            config[key] = value

    app.config = config
    app.controller = Controller(config['db'], config['dboptions'],
                                broker=config['broker'])

    if config['debug']:
        bottle.debug(True)

    print('Running on %s:%d...' % (config['host'], config['port']))
    server = WSGIServer((config['host'], config['port']), app,
                        handler_class=WebSocketHandler)
    try:
        return server.serve_forever()
    except KeyboardInterrupt:
        print('Bye!')
        return 0


if __name__ == '__main__':
    sys.exit(main())
