const net = require('node:net');

const listenHost = process.env.OLLAMA_BRIDGE_HOST || '172.17.0.1';
const listenPort = Number(process.env.OLLAMA_BRIDGE_PORT || 11435);
const targetHost = process.env.OLLAMA_TARGET_HOST || '127.0.0.1';
const targetPort = Number(process.env.OLLAMA_TARGET_PORT || 11434);

const server = net.createServer((client) => {
  const upstream = net.createConnection({ host: targetHost, port: targetPort });
  client.pipe(upstream);
  upstream.pipe(client);
  client.on('error', () => upstream.destroy());
  upstream.on('error', () => client.destroy());
});

server.listen(listenPort, listenHost, () => {
  console.log(`Ollama Docker bridge listening on ${listenHost}:${listenPort}`);
});

