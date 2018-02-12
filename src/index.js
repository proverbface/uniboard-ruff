/**
 * Created by cshao on 12/02/2018.
 */

'use strict';

var http = require('http');
var https = require('https');
var mqtt = require('mqtt');

var EventEmitter = require('events');

function getLocation(url) {
  var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
  return match && {
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7]
  }
}

function RuffClient(token) {
  this.token = token ? token : null;
}

RuffClient.prototype = new EventEmitter();

RuffClient.prototype.setToken = function(token) {
  this.token = token;
  this.mqttClient = null;
};

RuffClient.prototype.http = function(url, data, callback) {
  if (!url || !(data && typeof data === 'object' && Object.keys(data).length > 0)) {
    return;
  }

  var postData = JSON.stringify(data);

  var locationObj = getLocation(url);
  var agent;
  var defaultPort;
  if (locationObj.protocol === 'http:') {
    agent = http;
    defaultPort = 80;
  } else if (locationObj.protocol === 'https:') {
    agent = https;
    defaultPort = 443;
  } else {
    throw new Error('Unknown protocol in URL: ' + url);
  }
  var options = {
    protocol: locationObj.protocol,
    hostname: locationObj.hostname,
    port: locationObj.port ? locationObj.port : defaultPort,
    path: locationObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'X-Uniboard-Token': this.token ? this.token : ''
    }
  };

  var req = agent.request(options, function(res) {
    var responseText = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      responseText += chunk;
    });
    res.on('end', function() {
      callback(null, responseText);
    });
  });
  req.on('error', callback);

  req.write(postData);
  req.end();
};

RuffClient.prototype.connectMQTT = function() {
  this.mqttClient = mqtt.connect('mqtt://uniboard.io:1883', {
    clientId: this.token ? this.token : 'mqttjs_' + Math.random().toString(16).substr(2, 8)
  });
  this.mqttClient.on('connect', function () {
    this.emit('MQTT-connected', 'MQTT server connected');
  }.bind(this));
};

RuffClient.prototype.mqtt = function(topic, data) {
  if (!this.mqttClient) {
    this.connectMQTT();
  }
  this.mqttClient.publish(topic, JSON.stringify(data));
};

module.exports = function(token) {
  return new RuffClient(token);
};