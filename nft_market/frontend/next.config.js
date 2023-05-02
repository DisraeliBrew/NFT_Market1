	/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	env: {
		ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
		MARKET_CONTRACT_ADDRESS: process.env.MARKET_CONTRACT_ADDRESS,
		PRIVATE_ACCOUNT_KEY: process.env.PRIVATE_ACCOUNT_KEY
	},
};
