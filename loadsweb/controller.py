import time
from datetime import datetime
from hashlib import md5

from loads.db import get_database
from loads.transport.client import Client


def seconds_to_time(seconds):
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)

    res = []
    if days > 0:
        res.append('%d d' % days)
    if hours > 0:
        res.append('%d h' % hours)
    if minutes > 0:
        res.append('%d min' % minutes)
    if seconds > 0:
        res.append('%d sec' % seconds)

    if len(res) == 1:
        return res[0]
    else:
        return '%s and %s.' % (' '.join(res[:-1]), res[-1])


_COUNTS = ['addError', 'addSuccess', 'stopTestRun', 'startTest',
           'startTestRun', 'stopTest', 'add_hit',
           'socket_open', 'socket_message', 'socket_close',
           'socket_message']


class Controller(object):

    def __init__(self, db='redis', dboptions=None, broker=None):
        if dboptions is None:
            self.dboptions = {}
        else:
            self.dboptions = dboptions
        self.broker = broker
        self.backend = db
        self._init()

    def reconnect(self):
        self._init()

    def _init(self):
        self.db = get_database(self.backend, **self.dboptions)
        self.client = Client(self.broker)

    def stop(self, run_id):
        self.client.stop_run(run_id)
        self.get_broker_info()

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

    def get_run_info(self, run_id, data=True):
        result = {}
        # we need to batch XXX
        if data:
            data = self.db.get_data(run_id, size=100)
            result['data'] = data
            errors = {}

            for line in self.db.get_data(run_id, data_type='addError',
                                        size=100):  #groupby=True):
                error, tb, tb2 = line['exc_info']
                hashed = md5(error).hexdigest()
                if hashed in errors:
                    old_count, tb = errors[hashed]
                    errors[hashed] = old_count + 1, tb
                else:
                    errors[hashed] = 1, tb + '\n' + tb2

            errors = errors.items()
            errors.sort()
            result['errors'] = errors

        counts = self.db.get_counts(run_id)
        custom = {}
        for key, value in list(counts.items()):
            if key in _COUNTS:
                continue
            custom[key] = value
            del counts[key]

        result['custom'] = custom

        metadata = self.db.get_metadata(run_id)
        started = metadata.get('started')
        ended = metadata.get('ended', time.time())
        active = metadata.get('active', False)

        # aproximative = should be set by the broker
        if started is not None:
            if active:
                elapsed = time.time() - started
            else:
                elapsed = ended - started

            hits = counts.get('add_hit', 0)
            if hits == 0:
                rps = 0
            else:
                rps = hits / elapsed

            started = datetime.fromtimestamp(int(started))
            metadata['started'] = started.strftime('%Y-%m-%d %H:%M:%S')
            counts['rps'] = int(rps)
            counts['elapsed'] = seconds_to_time(elapsed)
        else:
            metadata['started'] = 'N/A'
            counts['rps'] = 0
            counts['elapsed'] = 0

        if metadata.get('active', False):
            metadata['active_label'] = 'Running'
        else:
            metadata['active_label'] = 'Ended'

        result['counts'] = counts
        result['metadata'] = metadata
        return result
