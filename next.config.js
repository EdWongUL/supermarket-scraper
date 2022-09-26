require('dotenv').config();

const nextConfig = {
	webpack: (config, options) => {
		// add src directory to modules resolution so we can use absolute imports
		config.resolve.modules = [...config.resolve.modules, './src'];

		return config;
	},
	publicRuntimeConfig: {
		// add any public environment variables here
	},
};

module.exports = nextConfig;
