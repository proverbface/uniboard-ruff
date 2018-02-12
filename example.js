/**
 * Created by cshao on 12/02/2018.
 */

'use strict';

// Pass token when creating client object. The token is used for client authentication and can be found in Uniboard's Settings tab.
var ruffClient = require('uniboard-ruff')('25f6db34-9ff1-47f4-b7bb-3721cafb2e23');

$.ready(function (error) {
  if (error) {
    console.log(error);
    return;
  }

  // Send data through HTTP protocol
  ruffClient.http('http://uniboard.io/data_api/device/59db5cd3d6021211cb346b0b', {
    "temp": 21.2,
    "humidity": 29.8
  }, function(err, res) {
    if (err) {
      console.log(err);
    }
    if (res) {
      console.log(res);
    }
  });

  // Send data through MQTT protocol
  ruffClient.connectMQTT();
  ruffClient.on('MQTT-connected', function() {
    ruffClient.mqtt('/data_api/device/59db5cd3d6021211cb346b0b', {
      "temp": 21.2,
      "humidity": 29.8
    });
  });
});

$.end(function () {

});
