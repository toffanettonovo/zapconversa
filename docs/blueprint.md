# **App Name**: WA Manager

## Core Features:

- Login de Usuário: Tela de login que imita o login do WhatsApp Web.
- Visualização de Conversas: Exibição de conversas com um layout idêntico ao do WhatsApp Web. Um usuário comum vê apenas as conversas e não tem acesso às configurações.
- Gerenciamento de Usuários: Painel de administração para gerenciar usuários: criar novos usuários, atribuir funções de usuário (usuário padrão ou administrador) e definir a instância que eles podem acessar.
- Gerenciamento de Instâncias: Painel de administração para configurar instâncias da Evolution API, definindo URLs e Webhooks para começar a receber dados de mensagens. Requer integração com a Evolution API.
- Resposta Inteligente: Ferramenta de Resposta Inteligente: Analisa as mensagens recentes em uma conversa e sugere respostas relevantes para o usuário enviar com um clique.
- Resumo de Conversa: Ferramenta de Sumarização com IA: Para conversas longas, gera um resumo dos pontos-chave e itens de ação para acompanhar rapidamente. O usuário poderá escolher se deseja um resumo 'curto' ou 'detalhado'.

## Style Guidelines:

- Cor primária: Teal escuro (#259B9A) para uma aparência profissional e moderna, em linha com a estética do WhatsApp Web.
- Cor de fundo: Teal acinzentado muito escuro (#122929) para manter a consistência com a interface do WhatsApp Web.
- Cor de destaque: Amarelo esverdeado claro (#BCE38A) para destacar elementos interativos chave e chamadas para ação.
- Fonte: 'Inter' sans-serif para títulos e corpo do texto, escolhida por sua aparência moderna e neutra, tornando-a adequada para textos longos.
- Use ícones simples e limpos, semelhantes ao WhatsApp, para ações como enviar mensagens, anexar arquivos e fazer chamadas de áudio.
- Mantenha um layout o mais próximo possível do WhatsApp Web, incluindo o posicionamento das listas de conversas, painéis de mensagens e campos de entrada. A área de administração pode ser renderizada no painel de mensagens ou em outra visualização dedicada, dependendo de qual parecer mais intuitiva para o usuário.
- Transições e animações sutis para ações como abrir conversas, enviar mensagens e receber novas mensagens.