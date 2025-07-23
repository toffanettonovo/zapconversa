'use server';

/**
 * @fileOverview An AI agent that provides smart replies based on recent messages in a conversation.
 *
 * - generateSmartReplies - A function that generates smart reply suggestions for a given conversation.
 * - GenerateSmartRepliesInput - The input type for the generateSmartReplies function.
 * - GenerateSmartRepliesOutput - The return type for the generateSmartReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSmartRepliesInputSchema = z.object({
  conversationHistory: z.string().describe('The recent messages in the conversation.'),
});
export type GenerateSmartRepliesInput = z.infer<typeof GenerateSmartRepliesInputSchema>;

const GenerateSmartRepliesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested replies.'),
});
export type GenerateSmartRepliesOutput = z.infer<typeof GenerateSmartRepliesOutputSchema>;

export async function generateSmartReplies(input: GenerateSmartRepliesInput): Promise<GenerateSmartRepliesOutput> {
  return generateSmartRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartRepliesPrompt',
  input: {schema: GenerateSmartRepliesInputSchema},
  output: {schema: GenerateSmartRepliesOutputSchema},
  prompt: `Você é um assistente de IA especializado em sugerir respostas inteligentes para conversas em andamento.

  Analise o histórico da conversa abaixo e forneça 3 sugestões de respostas relevantes e concisas que o usuário pode enviar.

  Histórico da Conversa:
  {{conversationHistory}}

  Formate sua resposta como um array JSON de strings.

  Exemplo:
  [
    "Sim, estou interessado.",
    "Obrigado pela informação!",
    "Preciso pensar sobre isso."
  ]
  `,
});

const generateSmartRepliesFlow = ai.defineFlow(
  {
    name: 'generateSmartRepliesFlow',
    inputSchema: GenerateSmartRepliesInputSchema,
    outputSchema: GenerateSmartRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
