var fs = require('fs');
var extend = require('util')._extend;

var config = {
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  directConnect: true,
  capabilities: {
    'browserName': 'chrome'
  },
  baseUrl: 'https://vparth.github.io/ng-tools/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
  specs: ['*.js']
};

// override with local config, if exists
var cfgGlobal = ~process.argv.indexOf('--cfg-global');
if (!cfgGlobal) {
  var localCfg = {};
  var localFn = __dirname+'/protractor.conf.local.js';
  if (fs.existsSync(localFn, fs.R_OK)) {
    localCfg = require(localFn).config;
    extend(config, localCfg);
  }
}

exports.config = config;
