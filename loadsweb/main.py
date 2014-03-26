import sys
import os
from json import dumps
import socket
import argparse

import bottle
from bottle import (route, SimpleTemplate, request,
                    app as _app, TEMPLATE_PATH, static_file,
                    abort, redirect)
from cork import Cork

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketHandler, WebSocketError

from beaker.middleware import SessionMiddleware

from loadsweb.controller import Controller
from loadsweb.util import load_conf

from loads.transport.client import TimeoutError
from loads.util import set_logger


_TMPL = os.path.join(os.path.dirname(__file__), 'templates')
_MEDIA = os.path.join(os.path.dirname(__file__), 'media')

TEMPLATE_PATH.append(_TMPL)


def authorize():
    def _authorize(func):
        def __authorize(*args, **kw):
            app.auth.require(fail_redirect='/login?from=%s' % request.path)
            return func(*args, **kw)
        return __authorize
    return _authorize


def render(name, **options):
    with open(os.path.join(_TMPL, name + '.tmpl')) as f:

        return SimpleTemplate(f.read(), lookup=[_TMPL]).render(**options)


@route('/')
@authorize()
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
        # trying to reconnect
        app.controller.reconnect()
        try:
            info = app.controller.get_broker_info()
        except TimeoutError:
            # welp.
            app.controller.close()
            return render('error', message='The Broker seems down')

    runs, inactives = _get_runs(size=10)
    return render('index', runs=runs, inactives=inactives,
                  controller=app.controller,
                  broker_info=info,
                  wsscheme=app.config['wsscheme'],
                  wsserver=app.config['wsserver'],
                  wsport=app.config['wsport'])


def _get_runs(size=10):
    """Returns the last :param size: runs.

    Return a list of active and inactive runs.
    """
    def _dated(run_id):
        info = app.controller.get_run_info(run_id, data=False)
        started = info['metadata'].get('started', 0)
        fqn = info['metadata'].get('fqn', '?')
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
@authorize()
def handle_run(run_id=None):
    info = app.controller.get_run_info(run_id)

    return render('run', run_id=run_id,
                  info=info, active=info['metadata'].get('active', False),
                  controller=app.controller,
                  wsscheme=app.config['wsscheme'],
                  wsserver=app.config['wsserver'],
                  wsport=app.config['wsport'])


#@authorize()
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
@authorize()
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
@authorize()
def handle_stop(run_id=None):
    app.controller.stop(run_id)
    redirect('/run/%s' % run_id)


@route('/media/<filename>')
def handle_media(filename):
    return static_file(filename, root=_MEDIA)


def post_get(name, default=''):
    return bottle.request.POST.get(name, default).strip()


@bottle.post('/login')
def login_post():
    """Authenticate users"""
    username = post_get('username')
    password = post_get('password')
    from_ = post_get('from')
    app.auth.login(username, password, success_redirect=from_,
                   fail_redirect='/login?from=%s' % from_)


@bottle.get('/login')
def login():
    """Authenticate users"""
    from_ = request.query.get('from', '/')
    return render('login', from_=from_)


@route('/logout')
def logout():
    app.auth.logout(success_redirect='/')


app = _app()


def _load_conf(config_file=None):
    # default config
    options = ['db', 'wsscheme', 'wsserver', 'wsport', 'broker', 'debug',
               'host', 'port']
    config = {'db': 'python',
              'dboptions': {},
              'wsscheme': 'ws',
              'wsserver': 'localhost',
              'wsport': 8080,
              'broker': 'ipc:///tmp/loads-front.ipc',
              'debug': True,
              'host': '0.0.0.0',
              'port': 8080}

    if config_file is not None:
        config_parser = Config(config_file)
        for key, value in config_parser.items('loads'):
            if key not in options:
                continue
            config[key] = value

    return config


def main():
    set_logger()
    parser = argparse.ArgumentParser(description='Run the Loads Dashboard')
    parser.add_argument('config', help='configuration file', nargs='?')
    args = parser.parse_args()
    config = load_conf(args.config)

    session = {
        'session.cookie_expires': True,
        'session.encrypt_key': 'XXXX',
        'session.httponly': True,
        'session.timeout': 3600 * 24,  # 1 day
        'session.type': 'cookie',
        'session.validate_key': True,
    }

    session_opts = {}
    for key, default in session.items():
        session_opts[key] = config.get(key, default)

    global app
    app = SessionMiddleware(app, session_opts)
    app.auth = Cork(config.get('auth_conf', 'auth_conf'))
    app.authorize = app.auth.make_auth_decorator(fail_redirect="/login",
                                                 role="user")
    app.config = config
    app.controller = Controller(config['db'], config['dboptions'],
                                broker=config['broker'])

    if config['debug']:
        bottle.debug(True)

    print('Running on http://%s:%d...' % (config['host'], config['port']))
    print('The broker is at %s' % config['broker'])
    server = WSGIServer((config['host'], config['port']), app,
                        handler_class=WebSocketHandler)
    try:
        return server.serve_forever()
    except KeyboardInterrupt:
        print('Bye!')
        return 0


if __name__ == '__main__':
    sys.exit(main())
