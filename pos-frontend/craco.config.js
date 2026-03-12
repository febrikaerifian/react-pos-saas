// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        {
          message: /the request of a dependency is an expression/,
        },
      ];
      return webpackConfig;
    },
  },
};