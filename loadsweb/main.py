import sys
from bottle import route, run
from bottle import app as _app


@route('/')
def index():
    return 'Hello'


app = _app()


def main():
    return run(host='localhost', port=8080)


if __name__ == '__main__':
    sys.exit(main())
