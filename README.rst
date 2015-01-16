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