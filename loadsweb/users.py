import os
from base64 import b64encode
from getpass import getpass
import json
import sys
import argparse

from beaker import crypto

from loadsweb.util import load_conf
from loads.util import set_logger


def add_user():
    """Command-line utility to add a user to the auth files
    """
    set_logger()
    parser = argparse.ArgumentParser(description='Adds users')
    parser.add_argument('config', help='configuration file', nargs='?')
    parser.add_argument('--overwrite', help='overwrite existing user',
                        action='store_true', default=False)

    args = parser.parse_args()
    config = load_conf(args.config)

    username = raw_input('username: ')
    pwd = getpass('password: ')

    salt = os.urandom(32)
    cleartext = "%s\0%s" % (username, pwd)
    h = crypto.generateCryptoKeys(cleartext, salt, 10)
    if len(h) != 32:
        raise RuntimeError("The PBKDF2 hash is %d bytes long instead"
                           "of 32. The pycrypto library might be "
                           "missing." % len(h))

    # 'p' for PBKDF2
    hash = b64encode('p' + salt + h)

    # now adding the user
    conf_dir = config.get('auth_conf', 'auth_conf')

    with open(os.path.join(conf_dir, 'users.json')) as f:
        users = json.loads(f.read())

    with open(os.path.join(conf_dir, 'roles.json')) as f:
        roles = json.loads(f.read())

    if username in users and not args.overwrite:
        print('User %r exists. Use --overwrite' % username)
        sys.exit(0)

    users[username] = {'email_addr': '', 'role': 'user', 'hash': hash,
                       'desc': ''}

    with open(os.path.join(conf_dir, 'users.json'), 'w') as f:
        f.write(json.dumps(users))

    if username not in roles['user']:
        roles['user'].append(username)
        with open(os.path.join(conf_dir, 'roles.json'), 'w') as f:
            f.write(json.dumps(roles))

    print('User %r added.' % username)
    sys.exit(1)
