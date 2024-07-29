# Websockify

[![GitHub](https://img.shields.io/github/license/teampanfu/websockify)](https://github.com/teampanfu/websockify)
[![GitHub issues](https://img.shields.io/github/issues/teampanfu/websockify)](https://github.com/teampanfu/websockify/issues)
[![npm](https://img.shields.io/npm/v/@teampanfu/websockify)](https://www.npmjs.com/package/@teampanfu/websockify)
![npm](https://img.shields.io/npm/dt/@teampanfu/websockify)

Websockify is a simplified reimplementation of [NoVNC's websockify](https://github.com/novnc/websockify-js) and is provided as a global npm package for ease of use.

## Prerequisites

Websockify requires Node.js. If you don't have Node.js installed, you can download and install it from the [official Node.js website](https://nodejs.org). This will also install npm, which is needed for installing Websockify.

## Installation

To use Websockify, you need to install it globally using npm. This will allow you to run the `websockify` command from anywhere on your system.

### Global Installation

Run the following command to install Websockify globally:

```bash
npm install -g @teampanfu/websockify
```

### Verifying the Installation

After installation, you can verify that Websockify is correctly installed by checking its version:

```bash
websockify --version
```

You should see the installed version number of Websockify, indicating that the installation was successful.

### Updating Websockify

To update Websockify to the latest version, run:

```bash
npm update -g @teampanfu/websockify
```

This will fetch the latest version and update your installation.

### Uninstalling Websockify

If you need to uninstall Websockify, run:

```bash
npm uninstall -g @teampanfu/websockify
```

This will remove Websockify from your system.

## Usage

### Basic Usage

To use Websockify, provide the WebSocket server port and the TCP server port as arguments.

```bash
websockify 9090 8080
```

This command initializes the WebSocket server on port 9090 and forwards traffic to the TCP server on port 8080.

### Using Host and Port

Optionally, include the IP address with the TCP server port:

```bash
websockify 9090 192.168.1.1:8080
```

### Using a JSON File for Port Mappings

You can use a JSON file to define multiple TCP server ports, which are mapped to specific IDs. This allows you to dynamically route WebSocket connections to different TCP ports based on the URL path.

#### JSON File Format

The JSON file should map IDs to TCP ports. Example:

```json
{
  "1234": 3000,
  "5678": 4000
}
```

In this example:

- `1234` maps to TCP port `3000`
- `5678` maps to TCP port `4000`

#### Using the JSON File

Provide the WebSocket server port and the path to the JSON file as arguments:

```bash
websockify 9090 /path/to/mappings.json
```

#### Websocket URL with ID

When using port mappings, include the ID in the WebSocket URL to connect to the corresponding TCP port. Example:

```bash
ws://localhost:9090/1234
```

This URL connects to the WebSocket server on port 9090 and routes the connection to TCP port 3000 based on the mappings in the JSON file.

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
