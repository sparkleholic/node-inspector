#!/usr/bin/env node

var DebugServer = require('../lib/debug-server').DebugServer,
    fs = require('fs'),
    path = require('path'),
    options = {};

process.argv.forEach(function (arg) {
  var parts;
  if (arg.indexOf('--') > -1) {
    parts = arg.split('=');
    if (parts.length > 1) {
      switch (parts[0]) {
      case '--web-port':
        options.webPort = parseInt(parts[1], 10);
        break;
      case '--web-host':
        options.webHost = (parts[1] && parts[1] !== 'null') ? parts[1] : null;
	    break;
      case '--debug-port':
          options.debugPort = parseInt(parts[1], 10);
          break;
      case '--debug-host':
          options.debugHost = (parts[1] && parts[1] !== 'null') ? parts[1] : null;
          break;
      default:
        console.log('unknown option: ' + parts[0]);
        break;
      }
    }
    else if (parts[0] === '--help') {
      console.log('Usage: node-inspector [options]');
      console.log('Options:');
      console.log('--web-host=[address]     address to host the inspector (default 0.0.0.0)');
      console.log('--web-port=[port]     port to host the inspector (default 8080)');
      console.log('--debug-host=[address]     address to host the node module (default 127.0.0.1)');
      console.log('--debug-port=[port]     port to host the node module (default 5858)');
      process.exit();
    }
  }
});

fs.readFile(path.join(__dirname, '../config.json'), function(err, data) {
  var config,
      debugServer;
  if (err) {
    console.warn("could not load config.json\n" + err.toString());
    config = {};
  }
  else {
    config = JSON.parse(data);
    if (config.hidden) {
      config.hidden = config.hidden.map(function(s) {
        return new RegExp(s, 'i');
      });
    }
  }
  if (!config.webPort) {
    config.webPort = 8080;
  }
  if (!config.webHost) {
    config.webHost = null;    // null implies listen on all interfaces
  }
  if (!config.debugHost) {
    config.debugHost = '127.0.0.1';
  }
  if (!config.debugPort) {
    config.debugPort = 5858;
  }
  if (options.webPort) {
    config.webPort = options.webPort;
  }
  if (options.webHost) {
    config.webHost = options.webHost;
  }
  if (options.debugPort) {
    config.debugPort = options.debugPort;
  }
  if (options.debugHost) {
    config.debugHost = options.debugHost;
  }

  debugServer = new DebugServer();
  debugServer.on('close', function () {
    console.log('session closed');
    process.exit();
  });
  debugServer.start(config);
});
