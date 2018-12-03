const environments = {};

environments.staging = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'staging'
};

environments.production = {
  'httpPort': 7000,
  'httpsPort': 7001,
  'envName': 'production'
};

const env = typeof(process.env.NODE_ENV) === 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : '';

const envToExport = typeof(environments[env]) === 'object'
  ? environments[env]
  : environments.staging;

module.exports = envToExport;
