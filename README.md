# loads-web

[![Build Status](https://travis-ci.org/loads/loads-web.svg?branch=master)](https://travis-ci.org/loads/loads-web)

Web dashboard for Loads, v2.
<https://github.com/loads/loads-broker>

 * Monitors active loadtests
 * View historic loadtest runs
 * Define load profiles (container sets)
 * Control load test runs


## Development

Setting the app up:

```sh
$ npm install
```

Watch and compile Stylus to CSS:

```sh
$ ./node_modules/.bin/stylus --watch --compress client/static/assets/stylus/app.styl --out client/static/assets/css/
```

Starting the server:
```sh
$ node server # or `npm start`
```


## Deployment

The dashboard is hosted by a Hapi server that proxies API requests to a
separate broker instance. This allows the front-end to be developed
independently of the broker, and provides a mechanism for serving mock data
if the broker does not implement a particular call.

You can use [awsbox](https://github.com/mozilla/awsbox) to deploy the Hapi
server to AWS:

```sh
# Create the instance.
> AWS_REGION=us-west-2 AWS_ID={id} AWS_SECRET={secret} \
  AWS_EMAIL=me@example.com awsbox create -n loads-web

# Deploy committed changes.
> git push loads-web HEAD:master
```
