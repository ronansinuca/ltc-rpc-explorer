"use strict";

const os = require('os');
const path = require('path');
const url = require('url');
const fs = require("fs");

const debug = require("debug");
const debugLog = debug("ltcexp:config");

const ltcUri = process.env.LTCEXP_LITECOIND_URI ? url.parse(process.env.LTCEXP_LITECOIND_URI, true) : { query: { } };
const ltcAuth = ltcUri.auth ? ltcUri.auth.split(':') : [];




function loadFreshRpcCredentials() {
	let username = ltcAuth[0] || process.env.LTCEXP_LITECOIND_USER;
	let password = ltcAuth[1] || process.env.LTCEXP_LITECOIND_PASS;

	let authCookieFilepath = ltcUri.query.cookie || process.env.LTCEXP_LITECOIND_COOKIE || path.join(os.homedir(), '.litecoin', '.cookie');

	let authType = "usernamePassword";

	if (!username && !password && fs.existsSync(authCookieFilepath)) {
		authType = "cookie";
	}

	if (authType == "cookie") {
		debugLog(`Loading RPC cookie file: ${authCookieFilepath}`);
		
		[ username, password ] = fs.readFileSync(authCookieFilepath).toString().trim().split(':', 2);
		
		if (!password) {
			throw new Error(`Cookie file ${authCookieFilepath} in unexpected format`);
		}
	}

	return {
		host: ltcUri.hostname || process.env.LTCEXP_LITECOIND_HOST || "127.0.0.1",
		port: ltcUri.port || process.env.LTCEXP_LITECOIND_PORT || 9332,

		authType: authType,

		username: username,
		password: password,
		
		authCookieFilepath: authCookieFilepath,
		
		timeout: parseInt(ltcUri.query.timeout || process.env.LTCEXP_LITECOIND_RPC_TIMEOUT || 5000),
	};
}

module.exports = {
	loadFreshRpcCredentials: loadFreshRpcCredentials,

	rpc: loadFreshRpcCredentials(),

	// optional: enter your api access key from ipstack.com below
	// to include a map of the estimated locations of your node's
	// peers
	// format: "ID_FROM_IPSTACK"
	ipStackComApiAccessKey: process.env.LTCEXP_IPSTACK_APIKEY,

	// optional: enter your api access key from mapbox.com below
	// to enable the tiles for map of the estimated locations of
	// your node's peers
	// format: "APIKEY_FROM_MAPBOX"
	mapBoxComApiAccessKey: process.env.LTCEXP_MAPBOX_APIKEY,

	// optional: GA tracking code
	// format: "UA-..."
	googleAnalyticsTrackingId: process.env.LTCEXP_GANALYTICS_TRACKING,

	// optional: sentry.io error-tracking url
	// format: "SENTRY_IO_URL"
	sentryUrl: process.env.LTCEXP_SENTRY_URL,
};
