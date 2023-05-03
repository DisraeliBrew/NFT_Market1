	/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	env: {
		ALCHEMY_MAINNET_KEY: process.env.ALCHEMY_MAINNET_KEY,
		ALCHEMY_MATIC_KEY: process.env.ALCHEMY_MATIC_KEY,
		MARKET_CONTRACT_ADDRESS: process.env.MARKET_CONTRACT_ADDRESS,
		PRIVATE_ACCOUNT_KEY: process.env.PRIVATE_ACCOUNT_KEY
	},
};
