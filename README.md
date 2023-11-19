# Websockify

[![GitHub](https://img.shields.io/github/license/teampanfu/websockify)](https://github.com/teampanfu/websockify)
[![GitHub issues](https://img.shields.io/github/issues/teampanfu/websockify)](https://github.com/teampanfu/websockify/issues)
[![npm](https://img.shields.io/npm/v/@teampanfu/websockify)](https://www.npmjs.com/package/@teampanfu/websockify)
![npm](https://img.shields.io/npm/dt/@teampanfu/websockify)

Websockify is a simplified reimplementation of [NoVNC's websockify](https://github.com/novnc/websockify-js) and is provided as a global npm package for ease of use.

## Prerequisites

- [Node.js](https://www.nodejs.org)

## Installation

To install Websockify globally, run:

```bash
npm install -g @teampanfu/websockify
```

## Usage

To use Websockify, provide the WebSocket server port and the TCP server port as arguments. The IP address is optional and defaults to `127.0.0.1`.

```bash
websockify 9090 127.0.0.1:8080
```

This command initializes the WebSocket server on port 9090 and forwards traffic to the TCP server at `127.0.0.1:8080`. Adjust the port numbers and IP address according to your specific configuration.

### Options

- `--cert` (`-c`): Path to an SSL certificate file for secure WebSocket connections (WSS).
- `--key` (`-k`): Path to an SSL key file for secure WebSocket connections (WSS).
- `--debug` (`-d`): Enable debugging mode.

## License

This software is open-source and is licensed under the [MIT License](LICENSE).
