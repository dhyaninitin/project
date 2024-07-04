pm2 = require('pm2')
os = require('os')
MACHINE_NAME = os.hostname()
instances = 0
maxMemory = process.env.WEB_MEMORY or 512

pm2.connect ->
  pm2.start {
    script: 'app.js'
    name: 'carblip-' + process.env.NODE_ENV
    exec_mode: 'cluster'
    instances: instances
    max_memory_restart: maxMemory + 'M'
    env: {}
    post_update: [ 'npm install' ]
  }, ->
    console.log "Started: " + MACHINE_NAME
    # Display logs in standard output
    pm2.launchBus (err, bus) ->
      console.log '[PM2] Log streaming started'
      bus.on 'log:out', (packet) ->
        console.log '[App:%s] %s', packet.process.name, packet.data
      bus.on 'log:err', (packet) ->
        console.error '[App:%s][Err] %s', packet.process.name, packet.data
