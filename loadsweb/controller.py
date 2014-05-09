import time
from datetime import datetime, timedelta
from hashlib import md5

import zmq
from loads.db import get_database
from loads.transport.client import Client


def finished(date):
    age = datetime.now() - date
    return seconds_to_time(age.total_seconds(), loose=True)


def seconds_to_time(seconds, loose=False):
    if seconds == 0:
        return 'Now.'

    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)
    res = []

    def _join():
        if len(res) == 1:
            return res[0]
        else:
            return '%s and %s.' % (' '.join(res[:-1]), res[-1])

    if days > 0:
        res.append('%d d' % days)
        if loose:
            return _join()
    if hours > 0:
        res.append('%d h' % hours)
        if loose:
            return _join()
    if minutes > 0:
        res.append('%d min' % minutes)
        if loose:
            return _join()

    if seconds > 0:
        res.append('%d sec' % seconds)

    return _join()


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
        self.db = None
        self.client = None
        self._init()

    def reconnect(self):
        self._init()

    def _init(self):
        # close any previous connector
        if self.client is not None:
            try:
                self.close()
            except zmq.ZMQError:
                pass
        self.db = get_database(self.backend, **self.dboptions)
        self.client = Client(self.broker, timeout_max_overflow=2.)

    def health_check(self):
        client = Client(self.broker, timeout_max_overflow=2.)
        ping = client.ping()
        total_agents = len(ping['agents'])
        if total_agents == 0:
            msg = 'No agents currently registered.'
            return False, msg, 0

        runs = client.list_runs().items()
        busy_agents = sum([len(agents) for run_id, agents in runs])
        avail = total_agents - busy_agents
        if avail == 0:
            # no agents are available.
            msg = 'All agents are busy.'
            return False, msg, 0

        args = {'fqn': 'loads.examples.test_blog.TestWebSite.test_health',
                'hits': '1',
                'agents': avail,
                'users': '1',
                'detach': True}

        client.run(args)
        return True, 'Health check launched', avail

    def close(self):
        self.client.close()
        self.db.close()

    def stop(self, run_id):
        self.client.stop_run(run_id)
        self.get_broker_info()

    def agent_status(self, agent_id):
        return self.client.status(agent_id)

    def ping_db(self):
        return self.db.ping()

    def get_broker_info(self):
        return self.client.ping()

    def get_runs(self, **filters):
        if filters == {}:
            return self.db.get_runs()

        runs = []

        for run_id in self.db.get_runs():
            metadata = self.db.get_metadata(run_id)
            for key, value in filters.items():
                if key not in metadata:
                    continue
                else:
                    if metadata[key] == value:
                        runs.append(run_id)
                        break

        return runs

    def get_run_info(self, run_id, data=True):
        result = {}
        # we need to batch XXX
        if data:
            data = self.db.get_data(run_id, size=100)
            result['data'] = data
            errors = {}

            for line in self.db.get_errors(run_id, size=100):
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

            def _stamp2time(stamp):
                if not isinstance(stamp, datetime):
                    stamp = datetime.fromtimestamp(int(stamp))
                return stamp.strftime('%Y-%m-%d %H:%M:%S UTC')

            started = datetime.fromtimestamp(int(started))
            metadata['started'] = _stamp2time(started)
            counts['rps'] = int(rps)
            counts['elapsed'] = seconds_to_time(elapsed)
            ended = started + timedelta(seconds=elapsed)
            counts['finished'] = finished(ended)
            metadata['ended'] = _stamp2time(ended)
            counts['success'] = counts.get('addError', 0) == 0
            metadata['style'] = counts['success'] and 'green' or 'red'
        else:
            metadata['started'] = metadata['ended'] = 'N/A'
            counts['rps'] = 0
            counts['elapsed'] = 0
            counts['finished'] = 'N/A'
            counts['success'] = False
            metadata['style'] = 'red'

        if metadata.get('active', False):
            metadata['active_label'] = 'Running'
        else:
            metadata['active_label'] = 'Ended'

        result['counts'] = counts
        result['metadata'] = metadata
        return result
