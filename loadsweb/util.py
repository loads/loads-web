import os
from konfig import Config
from bottle import TEMPLATE_PATH, SimpleTemplate, app, request


def load_conf(config_file=None):
    # default config
    options = ['db', 'wsserver', 'wsscheme', 'wsport', 'broker', 'debug',
               'host', 'port', 'no_auth']

    config = {'db': 'python',
              'dboptions': {},
              'wsscheme': 'ws',
              'wsserver': 'localhost',
              'wsport': 8080,
              'broker': 'ipc:///tmp/loads-front.ipc',
              'debug': True,
              'host': '0.0.0.0',
              'port': 8080,
              'no_auth': False}

    if config_file is not None:
        config_parser = Config(config_file)
        for key, value in config_parser.items('loads'):
            if key not in options:
                continue
            config[key] = value

    return config


def authorize():
    def _authorize(func):
        def __authorize(*args, **kw):
            if get_app().auth is not None:
                redir = '/login?from=%s' % request.path
                get_app().auth.require(fail_redirect=redir)
            return func(*args, **kw)
        return __authorize
    return _authorize


TMPL = os.path.join(os.path.dirname(__file__), 'templates')
TEMPLATE_PATH.append(TMPL)


def render(name, **options):
    with open(os.path.join(TMPL, name + '.tmpl')) as f:
        return SimpleTemplate(f.read(), lookup=[TMPL]).render(**options)


#
# meh...
#
_app = app()


def set_app(app):
    global _app
    _app = app


def get_app():
    return _app
