import time
from datetime import datetime

from loads.db import get_database
from loads.transport.client import Client


class Controller(object):

    def __init__(self, db='redis', dboptions=None, broker=None):
        if dboptions is None:
            self.dboptions = {}
        else:
            self.dboptions = dboptions

        self.db = get_database(db, **self.dboptions)
        self.client = Client(broker)

    def ping_db(self):
        return self.db.ping()

    def get_broker_info(self):
        return self.client.ping()

    def get_runs(self, **filters):
        if filters == {}:
            return self.db.get_runs()

        runs = []

        for run in self.db.get_runs():
            info = self.get_run_info(run)
            for key, value in filters.items():
                if key not in info['metadata']:
                    continue
                else:
                    if info['metadata'][key] == value:
                        runs.append(run)
                        break

        return runs

    def get_run_info(self, run_id):
        data = self.db.get_data(run_id)
        counts = self.db.get_counts(run_id)
        metadata = self.db.get_metadata(run_id)
        started = metadata.get('started')

        # aproximative = should be set by the broker
        if started is not None:
            now = time.time()
            elapsed = now - started
            hits = counts.get('add_hit', 0)
            if hits == 0:
                rps = 0
            else:
                rps = hits / elapsed

            started = datetime.fromtimestamp(int(started))
            metadata['started'] = started.strftime('%Y-%m-%d %H:%M:%S')
            counts['rps'] = int(rps)
            counts['elapsed'] = int(elapsed)
        else:
            metadata['started'] = 'N/A'
            counts['rps'] = 0
            counts['elapsed'] = 0

        return {'data': data, 'counts': counts,
                'metadata': metadata}
