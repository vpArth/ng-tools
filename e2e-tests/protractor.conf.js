var fs = require('fs');
var extend = require('util')._extend;

var config = {
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  directConnect: true,
  capabilities: {
    'browserName': 'chrome'
  },
  params: {
      url: 'https://vparth.github.io/ng-tools'
  },
  baseUrl: 'https://vparth.github.io/ng-tools',
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
  specs: ['*.js']
};

// override with local config, if exists
var localCfg = {};
var localFn = __dirname+'/protractor.conf.local.js';
if (fs.existsSync(localFn, fs.R_OK)) {
  localCfg = require(localFn).config;
  extend(config, localCfg);
}
console.log(config);


exports.config = config;
