	/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	env: {
		ALCHEMY_MAINNET_KEY: process.env.ALCHEMY_MAINNET_KEY,
		ALCHEMY_MATIC_KEY: process.env.ALCHEMY_MATIC_KEY,
		MARKET_ADDRESS: process.env.MARKET_ADDRESS,
		MARKET_OWNER_KEY: process.env.MARKET_OWNER_KEY
	},
};
