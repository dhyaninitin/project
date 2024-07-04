var config = require('config');

var wagner = require('wagner-core');

var Sequelize = require('sequelize');

var AWS = require('aws-sdk');

var _ = require('underscore');

var async = require('async');

var csv = require('csv-streamify');

var fs = require('fs');

var Papa = require('papaparse');

var moment = require('moment');

var PromiseFtp = require('promise-ftp');

var Promise = require('bluebird');

var chunk = require('chunk');

var gunzip = require('gunzip-file');

wagner.factory('config', config);

AWS.config.update({
  region: "us-phoenix-1",
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  endpoint: config.endpoint
});

wagner.factory('logger', function() {
  return require('./src/utils/logger');
});

sequelize = require('./src/utils/db')(wagner);

wagner.factory('sequelize', function() {
  return sequelize;
});

require('./src/models')(sequelize, wagner);

require('./src/utils/dependencies')(wagner, sequelize);

require('./src/manager')(wagner);

wagner.get('VehicleInventoryManager').fetchFtpConnections().then((function(_this) {
  return function(cons) {
    return async.eachSeries(cons, (function(con, callback) {
      return fetchfile(con, callback);
    }), function(error) {
      if (error != null) {
        return console.log("All Completed");
      }
    });
  };
})(this))["catch"]((function(_this) {
  return function(error) {
    return console.log(error);
  };
})(this));

fetchfile = (function(_this) {
  return function(connection, outerCallback) {
    var ftp;
    ftp = new PromiseFtp();
    console.log("Connecting for " + connection.user);
    return ftp.connect({
      host: connection.host,
      user: connection.user,
      password: connection.password
    }).then(function(serverMessage) {
      console.log(serverMessage);
      return async.waterfall([
        function(callback) {
          return ftp.list('/').then(function(listing) {
            return callback(null, listing);
          })["catch"](function(error) {
            return callback(error, null);
          });
        }, function(listing, callback) {
          console.log(listing);
          return callback(null, connection.file_name);
        }, function(file_name, callback) {
          if (connection.user === 'carblip.com') {
            return ftp.list('/Outbound/.').then(function(outbound_listing) {
              console.log(outbound_listing);
              return ftp.get('/Outbound/' + file_name).then(function(stream) {
                var raw_file_name;
                stream.pipe(fs.createWriteStream(file_name));
                raw_file_name = file_name.substr(0, file_name.lastIndexOf('.'));
                stream.on('finish', function(result) {
                  console.log("Stream Finished");
                  console.log("Extracting now");
                  return gunzip(file_name, raw_file_name, function() {
                    return callback(null, raw_file_name);
                  });
                });
                return stream.on('error', function(result) {
                  console.log("Stream Error");
                  return callback(null, raw_file_name);
                });
              });
            });
          } else {
            return ftp.get(file_name).then(function(stream) {
              stream.pipe(fs.createWriteStream(file_name));
              stream.on('finish', function(result) {
                console.log("Stream Finished");
                return callback(null, file_name);
              });
              return stream.on('error', function(result) {
                console.log("Stream Error");
                return callback(null, file_name);
              });
            });
          }
        }
      ], function(error, result) {
        return ftp.end().then(function() {
          return parseFile(result, connection).then(function(result) {
            return outerCallback(null);
          });
        });
      });
    })["catch"](function(error) {
      return outerCallback(error);
    });
  };
})(this);

parseFile = (function(_this) {
  return function(file_name, connection) {
    return new Promise(function(resolve, reject) {
      var content, delimiter, vehicle_inventory_array;
      vehicle_inventory_array = new Array;
      content = fs.readFileSync(file_name, "utf8");
      if (connection.user === 'vauto') {
        delimiter = '\u0009';
      }
      if (connection.user === 'homenet') {
        delimiter = ',';
      }
      if (connection.user === 'cargigi') {
        delimiter = ',';
      }
      if (connection.user === 'carblip.com') {
        delimiter = '\u0009';
      }
      return Papa.parse(content, {
        header: true,
        delimiter: delimiter,
        step: function(row) {
          var line;
          line = row.data[0];
          if (connection.user === 'vauto') {
            vehicle_inventory_array.push(wagner.get('VautoSerializer').serialized(line));
          }
          if (connection.user === 'homenet') {
            vehicle_inventory_array.push(wagner.get('HomenetSerializer').serialized(line));
          }
          if (connection.user === 'cargigi') {
            vehicle_inventory_array.push(wagner.get('CargigiSerializer').serialized(line));
          }
          if (connection.user === 'carblip.com') {
            return vehicle_inventory_array.push(wagner.get('VastSerializer').serialized(line));
          }
        },
        complete: function() {
          return sendToSQS(vehicle_inventory_array).then((function(_this) {
            return function(result) {
              fs.unlinkSync(file_name);
              return resolve(null);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return reject(error);
            };
          })(this));
        }
      });
    });
  };
})(this);

sendToSQS = (function(_this) {
  return function(inventory_array) {
    return new Promise(function(resolve, reject) {
      var array_chunk;
      array_chunk = chunk(inventory_array, 10);
      return async.map(array_chunk, (function(inventory, callback) {
        return wagner.get('SQSTransport').sendMessage(JSON.stringify(inventory), 'vehicle_inventory_processor', function(error, result) {
          return callback(error, result);
        });
      }), function(error, results) {
        return resolve(results);
      });
    });
  };
})(this);

// ---
// generated by coffee-script 1.9.2
