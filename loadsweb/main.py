import sys
import os

from bottle import route, run, SimpleTemplate
from bottle import app as _app, TEMPLATE_PATH

from loadsweb.controller import Controller

_TMPL = os.path.join(os.path.dirname(__file__), 'templates')
TEMPLATE_PATH.append(_TMPL)


def render(name, **options):
    with open(os.path.join(_TMPL, name + '.tmpl')) as f:

        return SimpleTemplate(f.read(), lookup=[_TMPL]).render(**options)


@route('/')
def index():
    return render('index', runs=app.controller.get_runs())


app = _app()
app.controller = Controller()


def main():
    return run(host='localhost', port=8080)


if __name__ == '__main__':
    sys.exit(main())
