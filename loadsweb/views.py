import os
from json import dumps
import socket
from collections import defaultdict
import bleach

from bottle import route, request, static_file, abort, redirect, post, get

from geventwebsocket import WebSocketError
import gevent
import zmq

from loads.transport.client import TimeoutError
from loadsweb.util import get_app as _a, authorize, render


_MEDIA = os.path.join(os.path.dirname(__file__), 'media')


@route('/')
@authorize()
def handle_index():
    if not _a().controller.ping_db():
        # the DB is down.
        # XXX status code ?
        # XXX redirect w/
        _a().controller.reconnect()
        return render('error', message='The DB seems down')

    try:
        info = _a().controller.get_broker_info()
    except (TimeoutError, zmq.ZMQError):
        # the broker is down.
        # trying to reconnect
        _a().controller.reconnect()
        try:
            info = _a().controller.get_broker_info()
        except (TimeoutError, zmq.ZMQError):
            # welp.
            _a().controller.close()
            return render('error', message='The Broker seems down')

    runs, inactives = _get_runs(size=30)

    options = {}
    if 'msg' in request.GET:
        options['message'] = bleach.clean(request.GET['msg'])

    return render('index', runs=runs, inactives=inactives,
                  controller=_a().controller,
                  broker_info=info,
                  wsserver=_a().config['wsserver'],
                  wsport=_a().config['wsport'],
                  wsscheme=_a().config['wsscheme'],
                  **options)


@route('/health_check')
@authorize()
def health_check():
    result, msg, agents = _a().controller.health_check()
    redirect('/?msg=' + msg)


@route('/agents')
@authorize()
def handle_agents():
    info = _a().controller.get_broker_info()

    # agents by hostname
    hosts = defaultdict(list)
    numagents = len(info['agents'])

    for pid, info in info['agents'].items():
        agent = {'pid': pid}
        # check if the agent is doing something...
        agent['status'] = _a().controller.agent_status(pid)
        hosts[info['hostname']].append(agent)

    hosts = hosts.items()
    hosts.sort()
    return render('agents', hosts=hosts, numagents=numagents)


def _get_runs(size=10):
    """Returns the last :param size: runs.

    Return a list of active and inactive runs.
    """
    def _dated(run_id):
        info = _a().controller.get_run_info(run_id, data=False)
        started = info['metadata'].get('started', 0)
        fqn = info['metadata'].get('fqn', '?')
        return started, fqn, run_id, info

    runs = [_dated(run) for run in _a().controller.get_runs(active=True,
                                                            data=False)]
    runs.sort()
    inactives = [_dated(run) for run in _a().controller.get_runs(stopped=True,
                                                                 data=False)]
    inactives.sort()
    inactives.reverse()
    return runs[:size], inactives[:size]


@route('/run/<run_id>')
@authorize()
def handle_run(run_id=None):
    info = _a().controller.get_run_info(run_id)

    return render('run', run_id=run_id,
                  info=info, active=info['metadata'].get('active', False),
                  controller=_a().controller,
                  wsserver=_a().config['wsserver'],
                  wsport=_a().config['wsport'],
                  wsscheme=_a().config['wsscheme'])


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
            info = _a().controller.get_run_info(run_id)
            del info['data']
            wsock.send(dumps(info))
            gevent.sleep(1.)
        except (WebSocketError, socket.error):
            break


@route('/run/<run_id>/stop')
@authorize()
def handle_stop(run_id=None):
    _a().controller.stop(run_id)
    redirect('/run/%s' % run_id)


@route('/media/<filename>')
def handle_media(filename):
    return static_file(filename, root=_MEDIA)


def post_get(name, default=''):
    return request.POST.get(name, default).strip()


@post('/login')
def login_post():
    """Authenticate users"""
    username = post_get('username')
    password = post_get('password')
    from_ = post_get('from')
    _a().auth.login(username, password, success_redirect=from_,
                    fail_redirect='/login?from=%s' % from_)


@get('/login')
def login():
    """Authenticate users"""
    from_ = request.query.get('from', '/')
    return render('login', from_=from_)


@route('/logout')
def logout():
    _a().auth.logout(success_redirect='/')
