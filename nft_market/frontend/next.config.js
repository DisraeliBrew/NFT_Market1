/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	env: {
		ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY
	},
};
