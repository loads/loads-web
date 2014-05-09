import os
import sys
from setuptools import setup, find_packages
from loadsweb import __version__


install_requires = ['bottle', 'loads', 'gevent-websocket', 'konfig',
                    'bottle-cork', 'bleach']

try:
    import argparse     # NOQA
except ImportError:
    install_requires.append('argparse')

with open("README.rst") as f:
    README = f.read()


setup(name='loadsweb',
      version=__version__,
      packages=find_packages(exclude=["docs"]),
      description="The Web Dashboard for Loads",
      long_description=README,
      author="Mozilla Foundation & contributors",
      author_email="services-dev@lists.mozila.org",
      include_package_data=True,
      zip_safe=False,
      classifiers=[
          "Programming Language :: Python",
          "Programming Language :: Python :: 2.6",
          "Programming Language :: Python :: 2.7",
          "License :: OSI Approved :: Apache Software License",
          "Development Status :: 3 - Alpha"],
      install_requires=install_requires,
      tests_require=['unittest2', 'webtest'],
      test_suite='loadsweb.tests',
      entry_points="""
      [console_scripts]
      loads-web = loadsweb.main:main
      loads-hash = loadsweb.main:hash_pbkdf2
      loads-adduser = loadsweb.main:add_user
      """)
