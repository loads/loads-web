loads-web
=========

Web dashboard for Loads, v2.
https://github.com/loads/loads-broker

 * Monitors active loadtests
 * View historic loadtest runs
 * Define load profiles (container sets)
 * Control load test runs

This is a work in progress.  FOR DEMO ONLY.


Development
===========

Setting the app up:

	npm install

Watch and compile stylus to CSS:

	./node_modules/.bin/stylus --watch --compress client/static/assets/stylus/app.styl --out client/static/assets/css/

Starting the server:

	node server


Deployment
==========

The dashboard is hosted by a hapi server that proxies API requests to a
separate broker instance. This allows the front-end to be developed
independently of the broker, and provides a mechanism for serving mock data
if the broker does not implement a particular call.

You can use `awsbox <https://github.com/mozilla/awsbox>`_ to deploy the hapi
server to AWS:

.. code-block:: bash

    # Create the instance.
    > AWS_REGION=us-west-2 AWS_ID={id} AWS_SECRET={secret} \
      AWS_EMAIL=me@example.com awsbox create -n loads-web

    # Deploy committed changes.
    > git push loads-web HEAD:master
