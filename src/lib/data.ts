export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
};

export type User = {
  id: string;
  name: string;
  role: 'admin' | 'user';
  instance: string;
};

export const conversations: Conversation[] = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Ok, combinado! Te vejo lá.',
    timestamp: '10:40',
    unreadCount: 2,
    "data-ai-hint": "woman portrait",
  },
  {
    id: '2',
    name: 'Equipe de Marketing',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Carlos: Alguém pode revisar o copy?',
    timestamp: '10:35',
    "data-ai-hint": "team meeting",
  },
  {
    id: '3',
    name: 'Projeto Alfa',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Você: O build falhou novamente.',
    timestamp: 'Ontem',
    "data-ai-hint": "abstract project",
  },
  {
    id: '4',
    name: 'Beatriz Costa',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Obrigada pela ajuda!',
    timestamp: 'Ontem',
    "data-ai-hint": "woman smiling",
  },
    {
    id: '5',
    name: 'Conversa Longa para Resumo',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Vamos recapitular os pontos principais da nossa discussão sobre a campanha de marketing de verão. Primeiramente, concordamos em focar nos anúncios do Instagram e do Facebook, com um orçamento de R$5.000 para cada plataforma. A Ana ficou responsável por criar os visuais e o texto dos anúncios até sexta-feira. O João vai configurar as campanhas e o rastreamento de conversões. Também decidimos que a campanha será lançada no dia 15 do próximo mês e durará quatro semanas. Precisamos de uma reunião de acompanhamento em duas semanas para verificar o progresso. Alguma dúvida?',
    timestamp: '2 dias atrás',
    "data-ai-hint": "document summary",
  },
];

export const messages: Record<string, Message[]> = {
  '1': [
    { id: '1-1', text: 'Oi, tudo bem? Conseguiu ver o relatório que enviei?', sender: 'them', timestamp: '10:30' },
    { id: '1-2', text: 'Oi, tudo sim! Vi agora, parece ótimo. Só tenho uma dúvida na seção 3.', sender: 'me', timestamp: '10:32' },
    { id: '1-3', text: 'Claro, qual a sua dúvida?', sender: 'them', timestamp: '10:33' },
    { id: '1-4', text: 'Sobre o KPI de engajamento, não entendi como foi calculado.', sender: 'me', timestamp: '10:35' },
    { id: '1-5', text: 'Ah, sim. É a soma das curtidas e comentários dividida pelo alcance. Podemos ajustar se achar melhor.', sender: 'them', timestamp: '10:38' },
    { id: '1-6', text: 'Entendi. Não, perfeito. Só queria confirmar mesmo. Obrigada!', sender: 'me', timestamp: '10:39' },
    { id: '1-7', text: 'Ok, combinado! Te vejo lá.', sender: 'them', timestamp: '10:40' },
  ],
  '2': [
    { id: '2-1', text: 'Pessoal, a nova campanha de outono precisa ser finalizada até amanhã.', sender: 'them', timestamp: '10:30' },
    { id: '2-2', text: 'Carlos: Alguém pode revisar o copy?', sender: 'them', timestamp: '10:35' },
  ],
  '3': [
    { id: '3-1', text: 'O deploy de staging está no ar.', sender: 'them', timestamp: 'Ontem' },
    { id: '3-2', text: 'O build falhou novamente.', sender: 'me', timestamp: 'Ontem' },
  ],
  '4': [
    { id: '4-1', text: 'Pode me ajudar com uma coisa?', sender: 'them', timestamp: 'Ontem' },
    { id: '4-2', text: 'Claro!', sender: 'me', timestamp: 'Ontem' },
    { id: '4-3', text: 'Obrigada pela ajuda!', sender: 'them', timestamp: 'Ontem' },
  ],
   '5': [
    { id: '5-1', text: 'Olá equipe. Vamos discutir a campanha de marketing de verão. Quais são as propostas iniciais?', sender: 'them', timestamp: '2 dias atrás' },
    { id: '5-2', text: 'Acho que deveríamos focar no Instagram e Facebook. São nossas plataformas mais fortes.', sender: 'me', timestamp: '2 dias atrás' },
    { id: '5-3', text: 'Concordo. Qual seria o orçamento?', sender: 'them', timestamp: '2 dias atrás' },
    { id: '5-4', text: 'Sugiro R$5.000 para cada uma, totalizando R$10.000.', sender: 'me', timestamp: '2 dias atrás' },
    { id: '5-5', text: 'Parece razoável. Quem fica com as tarefas? Eu posso cuidar dos visuais e do copy.', sender: 'them', timestamp: '2 dias atrás' },
    { id: '5-6', text: 'Ótimo, Ana! Eu posso configurar as campanhas e o rastreamento. Quando lançamos?', sender: 'me', timestamp: '2 dias atrás' },
    { id: '5-7', text: 'Que tal dia 15 do próximo mês? E a campanha dura 4 semanas.', sender: 'them', timestamp: '2 dias atrás' },
    { id: '5-8', text: 'Perfeito. Marcamos um acompanhamento em duas semanas?', sender: 'me', timestamp: '2 dias atrás' },
    { id: '5-9', text: 'Vamos recapitular os pontos principais da nossa discussão sobre a campanha de marketing de verão. Primeiramente, concordamos em focar nos anúncios do Instagram e do Facebook, com um orçamento de R$5.000 para cada plataforma. A Ana ficou responsável por criar os visuais e o texto dos anúncios até sexta-feira. O João vai configurar as campanhas e o rastreamento de conversões. Também decidimos que a campanha será lançada no dia 15 do próximo mês e durará quatro semanas. Precisamos de uma reunião de acompanhamento em duas semanas para verificar o progresso. Alguma dúvida?', sender: 'them', timestamp: '2 dias atrás' }
  ],
};

export const users: User[] = [
    { id: '1', name: 'Admin Geral', role: 'admin', instance: 'Principal' },
    { id: '2', name: 'Ana Silva', role: 'user', instance: 'Principal' },
    { id: '3', name: 'Carlos Souza', role: 'user', instance: 'Secundária' },
];

export const instances = [
    { id: '1', name: 'Principal', apiUrl: 'https://api.principal.com', webhook: 'https://webhook.principal.com', status: 'connected' },
    { id: '2', name: 'Secundária', apiUrl: 'https://api.secundaria.com', webhook: 'https://webhook.secundaria.com', status: 'disconnected' },
];

export const currentUser = {
  id: 'user-1',
  name: 'Usuário Atual',
  avatar: 'https://placehold.co/40x40.png',
  role: 'admin',
  "data-ai-hint": "person avatar",
};
