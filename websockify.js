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

if (target.includes(':')) {
  const [host, portStr] = target.split(':');
  targetHost = host;
  targetPort = parseInt(portStr, 10);

  if (isNaN(targetPort)) {
    console.error('Invalid target port. It should be a valid number.');
    process.exit(1);
  }
} else if (!isNaN(target)) {
  targetPort = parseInt(target, 10);
  if (isNaN(targetPort)) {
    console.error('Invalid target port. It should be a valid number.');
    process.exit(1);
  }
} else {
  try {
    const filePath = path.resolve(target);
    tcpPortMappings = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
  server = http.createServer();
}

const wss = new WebSocket.Server({ server });

let connectionCounter = 0;

wss.on('error', (err) => {
  console.error(`WebSocket server error: ${err.message}`);
});

wss.on('connection', (ws, req) => {
  const urlParts = req.url.split('/');
  const id = urlParts[1];
  const currentTargetPort = id && tcpPortMappings[id] ? tcpPortMappings[id] : targetPort;

  if (!currentTargetPort) {
    ws.close(4000, 'Invalid ID');
    return;
  }

  const connectionId = `WS#${++connectionCounter} ${req.socket.remoteAddress}`;

  const tcpSocket = net.connect(currentTargetPort, targetHost, () => {
    debug(connectionId, 'TCP connection opened');
  });

  ws.on('message', (message) => {
    debug(connectionId, 'Received from WebSocket:', message.toString().trim());
    tcpSocket.write(message);
  });

  ws.on('error', (err) => {
    console.error(`[${connectionId}] WebSocket error: ${err.message}`);
    ws.close();
  });

  ws.on('close', (code, reason) => {
    debug(connectionId, `WebSocket closed with code: ${code}, reason: ${Buffer.isBuffer(reason) ? reason.toString('utf8') : reason}`);
    tcpSocket.end();
  });

  tcpSocket.on('data', (data) => {
    debug(connectionId, 'Received from TCP:', data.toString().trim());
    ws.send(data);
  });

  tcpSocket.on('error', (err) => {
    console.error(`[${connectionId}] TCP connection error: ${err.message}`);
    ws.close();
  });

  tcpSocket.on('close', () => {
    debug(connectionId, 'TCP connection closed');
    ws.close();
  });
});

server.listen(port, () => {
  const { address, port: serverPort } = server.address();
  console.log(`Proxying WebSocket connections from [${address}]:${serverPort} ${targetPort ? `to [${targetHost}]:${targetPort}` : `using mappings from file: ${target}`}`);
  console.log(cert && key ? `Running in secured WebSocket (wss://) mode\nSSL certificate: ${cert}\nSSL key: ${key}` : 'Running in unsecured WebSocket (ws://) mode');
  console.log(`Debug mode is ${isDebug ? 'enabled' : 'disabled'}`);
});
