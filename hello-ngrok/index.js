// Load environment variables from .env file in the current directory
require('dotenv').config();
const ngrok = require('@ngrok/ngrok');

// This script now only starts the ngrok tunnel and points it
// to port 9002, where the main Next.js application is running.
// The old test server on port 8080 has been removed.

console.log('Iniciando túnel do ngrok para a porta 9002...');

// Get your endpoint online
ngrok.connect({ addr: 9002, authtoken_from_env: true })
	.then(listener => console.log(`Túnel estabelecido em: ${listener.url()}`))
    .catch(err => {
        console.error('Erro ao estabelecer túnel do ngrok:', err);
        process.exit(1);
    });
