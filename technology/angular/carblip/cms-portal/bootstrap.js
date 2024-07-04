(function() {
  var MACHINE_NAME, instances, maxMemory, os, pm2;

  pm2 = require('pm2');

  os = require('os');

  MACHINE_NAME = os.hostname();

  instances = 0;

  maxMemory = process.env.WEB_MEMORY || 512;

  pm2.connect(function() {
    return pm2.start({
      script: 'server.js',
      name: 'carblip-' + process.env.NODE_ENV,
      exec_mode: 'cluster',
      instances: instances,
      max_memory_restart: maxMemory + 'M',
      env: {},
      post_update: ['npm install']
    }, function() {
      console.log("Started: " + MACHINE_NAME);
      return pm2.launchBus(function(err, bus) {
        console.log('[PM2] Log streaming started');
        bus.on('log:out', function(packet) {
          return console.log('[App:%s] %s', packet.process.name, packet.data);
        });
        return bus.on('log:err', function(packet) {
          return console.error('[App:%s][Err] %s', packet.process.name, packet.data);
        });
      });
    });
  });

}).call(this);
