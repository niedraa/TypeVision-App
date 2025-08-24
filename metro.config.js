const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ajouter le polyfill pour crypto
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: require.resolve('expo-crypto'),
};

module.exports = config;
