"use strict";

const axios = require("axios");
const utils = require("./../utils.js");


function getAddressDetails(address, scriptPubkey, sort, limit, offset) {
	return new Promise(async (resolve, reject) => {

		var limitOffset = limit + offset;
		var mainnetUrl = `https://api.blockcypher.com/v1/ltc/main/addrs/${address}?limit=${limitOffset}`;
		var url = (global.activeBlockchain == "main") ? mainnetUrl : mainnetUrl;

		var options = {
			url: url,
			headers: {
				'User-Agent': 'request'
			}
		};

		try {
			const apiResponse = await axios.get(
				url,
				{ headers: { "User-Agent": "axios" }});

			var blockcypherJson = apiResponse.data;

			var response = {};

			response.txids = [];
			response.blockHeightsByTxid = {};

			// blockcypher doesn't support offset for paging, so simulate up to the hard cap of 2,000
			for (var i = offset; i < Math.min(blockcypherJson.txrefs.length, limitOffset); i++) {
				var tx = blockcypherJson.txrefs[i];

				response.txids.push(tx.tx_hash);
				response.blockHeightsByTxid[tx.tx_hash] = tx.block_height;
			}

			response.txCount = blockcypherJson.n_tx;
			response.totalReceivedLit = blockcypherJson.total_received;
			response.totalSentLit = blockcypherJson.total_sent;
			response.balanceLit = blockcypherJson.final_balance;
			response.source = "blockcypher.com";

			resolve({addressDetails:response});

		} catch (err) {
			utils.logError("097wef0adsgadgs", err);

			reject(err);
		}
	});
}


module.exports = {
	getAddressDetails: getAddressDetails
};