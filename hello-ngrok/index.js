require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const ngrok = require('@ngrok/ngrok');

// Este script agora apenas inicia o túnel do ngrok e o aponta
// para a porta 9002, onde a aplicação principal do Next.js está rodando.
// O servidor de teste antigo na porta 8080 foi removido.

console.log('Iniciando túnel do ngrok para a porta 9002...');

// Get your endpoint online
ngrok.connect({ addr: 9002, authtoken_from_env: true })
	.then(listener => console.log(`Túnel estabelecido em: ${listener.url()}`))
    .catch(err => {
        console.