#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const path = require('path');
const WebSocket = require('ws');
const yargs = require('yargs');

const argv = yargs
  .scriptName('websockify')
  .usage('$0 <port> <target>', false, (yargs) => {
    yargs
      .positional('port', {
        describe: 'WebSocket server port',
        type: 'number',
      })
      .positional('target', {
        describe: 'TCP server port, host:port, or path to JSON file with ID-to-TCP-port mappings',
        type: 'string',
      });
  })
  .option('cert', {
    alias: 'c',
    describe: 'Path to SSL certificate file (for WSS)',
    type: 'string',
  })
  .option('key', {
    alias: 'k',
    describe: 'Path to SSL key file (for WSS)',
    type: 'string',
  })
  .option('debug', {
    alias: 'd',
    describe: 'Enable debugging mode',
    type: 'boolean',
  })
  .alias('version', 'v')
  .help(false)
  .argv;

const { port, target, cert, key, debug: isDebug } = argv;

let tcpPortMappings = {};
let targetHost = '127.0.0.1';
let targetPort = null;
let targetType = 'direct';

if (target.includes(':')) {
  const targetParts = target.split(':');
  targetHost = targetParts[0];
  targetPort = parseInt(targetParts[1], 10);

  if (isNaN(targetPort)) {
    console.error('Invalid target port. It should be a valid number.');
    process.exit(1);
  }
} else if (!isNaN(target)) {
  targetPort = target;
} else {
  try {
    const filePath = path.resolve(target);
    tcpPortMappings = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    targetType = 'mappings';
  } catch (error) {
    console.error(`Error reading or parsing target file: ${error.message}`);
    process.exit(1);
  }
}

const debug = (connectionId, ...args) => {
  if (isDebug) {
    console.log(`[${connectionId}]`, ...args);
  }
};

let server;

if (cert && key) {
  try {
    // If both a certificate and key are provided and they exist, set up an HTTPS server
    const httpsOptions = {
      cert: fs.readFileSync(cert),
      key: fs.readFileSync(key),
    };

    server = https.createServer(httpsOptions);
  } catch (error) {
    console.error(`Error reading certificate or key files: ${error.message}`);
    process.exit(1);
  }
} else {
  // If no certificate and key are provided, set up an HTTP server
  server = http.createServer();
}

const wss = new WebSocket.Server({ server });

let connectionCounter = 0;

wss.on('error', (error) => {
  console.error(`WebSocket server encountered an error: ${error.message}`);
});

wss.on('connection', (ws, req) => {
  let currentTargetPort = targetPort;

  if (!currentTargetPort) {
    const urlParts = req.url.split('/');
    const id = urlParts[1];

    if (!id || !tcpPortMappings[id]) {
      ws.close(4000, 'Invalid ID');
      return;
    }

    currentTargetPort = tcpPortMappings[id];
  }

  const connectionId = `WS#${++connectionCounter} ${req.socket.remoteAddress}`;

  const tcpSocket = net.connect(currentTargetPort, targetHost, () => {
    debug(connectionId, 'TCP connection opened');
  });

  ws.on('message', (message) => {
    debug(connectionId, 'Received from WebSocket:', message.toString().trim());
    tcpSocket.write(message);
  });

  ws.on('close', (code, reason) => {
    if (Buffer.isBuffer(reason)) {
      reason = reason.toString('utf8');
    }

    if (typeof reason === 'string' && reason.length > 0) {
      debug(connectionId, 'WebSocket connection closed with code:', code, 'and reason:', reason);
    } else {
      debug(connectionId, 'WebSocket connection closed with code:', code);
    }
    tcpSocket.end();
  });

  tcpSocket.on('data', (data) => {
    debug(connectionId, 'Received from TCP:', data.toString().trim());
    ws.send(data);
  });

  tcpSocket.on('error', (err) => {
    console.error(`[${connectionId}] Failed to establish the TCP connection: ${err.message}`);
    ws.close();
  });

  tcpSocket.on('close', () => {
    debug(connectionId, 'TCP connection closed');
    ws.close();
  });
});

server.listen(port, () => {
  const serverAddress = server.address();

  if (targetType === 'mappings') {
    console.log(`Proxying WebSocket connections from [${serverAddress.address}]:${serverAddress.port} using mappings from file: ${target}`);
  } else {
    console.log(`Proxying WebSocket connections from [${serverAddress.address}]:${serverAddress.port} to [${targetHost}]:${targetPort}`);
  }

  if (cert && key) {
    console.log('Running in secured WebSocket (wss://) mode');
    console.log(`SSL certificate: ${cert}`);
    console.log(`SSL key: ${key}`);
  } else {
    console.log('Running in unsecured WebSocket (ws://) mode');
  }

  if (isDebug) {
    console.log('Debug mode is enabled');
  } else {
    console.log('Debug mode is disabled, only errors will be logged');
  }
});
