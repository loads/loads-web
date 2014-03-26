from konfig import Config


def load_conf(config_file=None):
    # default config
    options = ['db', 'wsserver', 'wsport', 'broker', 'debug', 'host', 'port']
    config = {'db': 'python',
              'dboptions': {},
              'wsserver': 'localhost',
              'wsport': 8080,
              'broker': 'ipc:///tmp/loads-front.ipc',
              'debug': True,
              'host': '0.0.0.0',
              'port': 8080}

    if config_file is not None:
        config_parser = Config(config_file)
        for key, value in config_parser.items('loads'):
            if key not in options:
                continue
            config[key] = value

    return config
