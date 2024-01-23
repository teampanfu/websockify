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

To use Websockify, provide the WebSocket server port and the TCP server port as arguments.

```bash
websockify 9090 8080
```

This command initializes the WebSocket server on port 9090 and forwards traffic to the TCP server. Optionally, include the IP address with the TCP server port:

```bash
websockify 9090 192.168.1.1:8080
```

Adjust the port numbers and, if needed, include the IP address according to your specific configuration.

### SSL Certificate (WSS)

For secure WebSocket connections (WSS), use SSL certificates. To enable SSL, include the `--cert` (`-c`) and `--key` (`-k`) options in the command, providing the paths to the SSL certificate and key files, respectively.

```bash
websockify 9090 8080 --cert /path/to/certificate.crt --key /path/to/private-key.key
```

#### Creating SSL Certificates with OpenSSL

If you don't have SSL certificates, you can create them using OpenSSL. Here's a basic example:

```bash
openssl req -x509 -newkey rsa:4096 -keyout private-key.key -out certificate.crt -days 365 -nodes
```

This command generates a self-signed certificate (`certificate.crt`) and a private key (`private-key.key`). Adjust the parameters as needed.

### Debugging

To enable debugging mode, use the `--debug` (`-d`) option:

```bash
websockify 9090 8080 --debug
```

## License

This software is open-source and is licensed under the [MIT License](LICENSE).
