"use strict";

const axios = require("axios");
const utils = require("./../utils.js");


function getAddressDetails(address, scriptPubkey, sort, limit, offset) {
	// Note: blockchair api seems to not respect the limit parameter, always using 100
	return new Promise(async (resolve, reject) => {
		var mainnetUrl = `https://api.blockchair.com/litecoin/dashboards/address/${address}/?offset=${offset}`;
		var url = (global.activeBlockchain == "main") ? mainnetUrl : mainnetUrl;

		var options = {
			url: url,
			headers: {
				'User-Agent': 'request'
			}
		};

		try {
			const response = await axios.get(
				url,
				{ headers: { "User-Agent": "axios" }});

			var responseObj = response.data;
			responseObj = responseObj.data[address];

			var result = {};

			result.txids = [];

			// blockchair doesn't support offset for paging, so simulate up to the hard cap of 2,000
			for (var i = 0; i < Math.min(responseObj.transactions.length, limit); i++) {
				var txid = responseObj.transactions[i];

				result.txids.push(txid);
			}

			result.txCount = responseObj.address.transaction_count;
			result.totalReceivedLit = responseObj.address.received;
			result.totalSentLit = responseObj.address.spent;
			result.balanceLit = responseObj.address.balance;
			result.source = "blockchair.com";

			resolve({addressDetails:result});

		} catch (err) {
			utils.logError("308dhew3w83", err);

			reject(err);
		}
	});
}


module.exports = {
	getAddressDetails: getAddressDetails
};