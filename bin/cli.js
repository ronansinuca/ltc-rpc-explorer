#!/usr/bin/env node

var debug = require("debug");
var debugLog = debug("ltcexp:config");

// to debug arg settings, enable the below line:
//debug.enable("ltcexp:*");

const args = require('meow')(`
	Usage
	  $ ltc-rpc-explorer [options]

	Options
	  -p, --port <port>			  port to bind http server [default: 3003]
	  -i, --host <host>			  host to bind http server [default: 127.0.0.1]
	  -a, --basic-auth-password <..> protect web interface with a password [default: no password]
	  -C, --coin <coin>			  crypto-coin to enable [default: LTC]

	  -b, --litecoind-uri <uri>	   connection URI for litecoind rpc (overrides the options below)
	  -H, --litecoind-host <host>	 hostname for litecoind rpc [default: 127.0.0.1]
	  -P, --litecoind-port <port>	 port for litecoind rpc [default: 9332]
	  -c, --litecoind-cookie <path>   path to litecoind cookie file [default: ~/.litecoin/.cookie]
	  -u, --litecoind-user <user>	 username for litecoind rpc [default: none]
	  -w, --litecoind-pass <pass>	 password for litecoind rpc [default: none]

	  --address-api <option>		 api to use for address queries (options: electrum, blockchain.com, blockchair.com, blockcypher.com) [default: none]
	  -E, --electrum-servers <..>   comma separated list of electrum servers to use for address queries; only used if --address-api=electrum [default: none]

	  --rpc-allowall				 allow all rpc commands [default: false]
	  --rpc-blacklist <methods>	  comma separated list of rpc commands to block [default: see in config.js]
	  --cookie-secret <secret>	   secret key for signed cookie hmac generation [default: hmac derive from litecoind pass]
	  --demo						 enable demoSite mode [default: disabled]
	  --no-rates					 disable fetching of currency exchange rates [default: enabled]
	  --slow-device-mode			 disable performance-intensive tasks (e.g. UTXO set fetching) [default: enabled]
	  --privacy-mode				 enable privacyMode to disable external data requests [default: disabled]
	  --max-mem <bytes>			  value for max_old_space_size [default: 1024 (1 GB)]

	  --ganalytics-tracking <tid>	tracking id for google analytics [default: disabled]
	  --sentry-url <sentry-url>	  sentry url [default: disabled]

	  -e, --node-env <env>		   nodejs environment mode [default: production]
	  -h, --help					 output usage information
	  -v, --version				  output version number

	Examples
	  $ ltc-rpc-explorer --port 8080 --litecoind-port 19443 --litecoind-cookie ~/.litecoin/regtest/.cookie
	  $ ltc-rpc-explorer -p 8080 -P 19443 -c ~/.litecoin/regtest.cookie

	Or using connection URIs
	  $ ltc-rpc-explorer -b litecoin://bob:myPassword@127.0.0.1:19443/
	  $ ltc-rpc-explorer -b litecoin://127.0.0.1:19443/?cookie=$HOME/.litecoin/regtest/.cookie

	All options may also be specified as environment variables
	  $ LTCEXP_PORT=8080 LTCEXP_litecoinD_PORT=19443 LTCEXP_litecoinD_COOKIE=~/.litecoin/regtest/.cookie ltc-rpc-explorer


`, {
		flags: {
			port: {alias:'p'},
			host: {alias:'i'},
			basicAuthPassword: {alias:'a'},
			coin: {alias:'C'},
			litecoindUri: {alias:'b'},
			litecoindHost: {alias:'H'},
			litecoindPort: {alias:'P'},
			litecoindCookie: {alias:'c'},
			litecoindUser: {alias:'u'},
			litecoindPass: {alias:'w'},
			demo: {},
			rpcAllowall: {},
			electrumServers: {alias:'E'},
			nodeEnv: {alias:'e', default:'production'},
			privacyMode: {},
			slowDeviceMode: {}
		}
	}
).flags;

const envify = k => k.replace(/([A-Z])/g, '_$1').toUpperCase();

Object.keys(args).filter(k => k.length > 1).forEach(k => {
	if (args[k] === false) {
		debugLog(`Config(arg): LTCEXP_NO_${envify(k)}=true`);

		process.env[`LTCEXP_NO_${envify(k)}`] = true;

	} else {
		debugLog(`Config(arg): LTCEXP_${envify(k)}=${args[k]}`);

		process.env[`LTCEXP_${envify(k)}`] = args[k];
	}
});

require('./www');
