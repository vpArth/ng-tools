exports.config = {
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  directConnect: true,
  capabilities: {
    'browserName': 'chrome'
  },

  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },


  specs: ['*.js']
};
