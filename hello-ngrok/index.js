// Load environment variables from .env file in the current directory
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const ngrok = require('@ngrok/ngrok');
const http = require('http');

console.log('Iniciando túnel do ngrok para a porta 9002...');

// Get your endpoint online
ngrok.connect({ addr: 9002, authtoken_from_env: true })
	.then(listener => console.log(`Túnel estabelecido em: ${listener.url()}`))
    .catch(err => {
        console.error('Erro ao estabelecer túnel do ngrok:', err);
        process.exit(1);
    });

// Create a barebones HTTP server to keep the script alive.
// This server doesn't do anything, but it prevents the Node process
// from exiting, which stops the pm2 restart loop.
http.createServer((req, res) => {
	res.writeHead(200);
	res.end('ngrok-runner is active');
}).listen(8081, () => {
    console.log('Servidor de manutenção do ngrok rodando na porta 8081 para manter o processo vivo.');
});
