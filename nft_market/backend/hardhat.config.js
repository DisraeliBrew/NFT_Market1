require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config()

module.exports = {
	solidity: {
		version: "0.8.9",
		settings: {
			optimizer: {
				enabled: true
			}
		}
	},
	allowUnlimitedContractSize: true,
	networks: {
		hardhat: {},
		ETH_MAINNET: {
			accounts: [`0x${process.env.PRIVATE_KEY}`],
			url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
		},
		ETH_GOERLI: {
			accounts: [`0x${process.env.PRIVATE_KEY}`],
			url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
		},
		POLYGON_MAINNET: {
			accounts: [`0x${process.env.PRIVATE_KEY}`],
			url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
		},
		POLYGON_MUMBAI: {
			accounts: [`0x${process.env.PRIVATE_KEY}`],
			url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
		}
	},
	etherscan: {
		apiKey: `${process.env.ETHERSCAN_API_KEY}`
	}
}