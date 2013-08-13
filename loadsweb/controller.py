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

    def get_run_info(self, run_id):
        data = self.db.get_data(run_id)
        counts = self.db.get_counts(run_id)
        metadata = self.db.get_metadata(run_id)
        return {'data': data, 'counts': counts,
                'metadata': metadata}
