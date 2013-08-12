from loads.transport.client import Client
from loads.db import get_database


class Controller(object):

    def __init__(self, db='redis', dboptions=None):
        if dboptions is None:
            self.dboptions = {}
        else:
            self.dboptions = dboptions

        self.db = get_database(db, **self.dboptions)

    def get_runs(self):
        return self.db.get_runs()
