import sys
import argparse

import bottle
from cork import Cork

from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketHandler

from beaker.middleware import SessionMiddleware

from loadsweb.controller import Controller
from loadsweb.util import load_conf, get_app, set_app
# loads all views
from loadsweb import views    # noqa

from loads.util import set_logger


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

    app = SessionMiddleware(get_app(), session_opts)
    app.auth = Cork(config.get('auth_conf', 'auth_conf'))
    app.authorize = app.auth.make_auth_decorator(fail_redirect="/login",
                                                 role="user")
    app.config = config
    app.controller = Controller(config['db'], config['dboptions'],
                                broker=config['broker'])

    set_app(app)
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
