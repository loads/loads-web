from webtest import TestApp
import unittest2
from loadsweb.main import app


class TestMain(unittest2.TestCase):

    def setUp(self):
        self.app = TestApp(app)

    def test_index_and_run(self):
        resp = self.app.get('/')
        self.assertTrue('Active runs' in resp.text)
        first_link = resp.html.find_all('a')[0]['href']
        run_page = self.app.get(first_link)
        self.assertTrue(run_page.status_code, 200)

