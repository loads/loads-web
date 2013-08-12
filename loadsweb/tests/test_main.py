from webtest import TestApp
import unittest2
from loadsweb.main import app


class TestMain(unittest2.TestCase):

    def setUp(self):
        self.app = TestApp(app)

    def test_index(self):
        resp = self.app.get('/')
        self.assertEqual(resp.text, 'Hello')
