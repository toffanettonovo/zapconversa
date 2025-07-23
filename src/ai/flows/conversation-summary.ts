// src/ai/flows/conversation-summary.ts
'use server';

/**
 * @fileOverview Summarizes conversations to extract key points and action items.
 *
 * - conversationSummary - A function that summarizes a conversation.
 * - ConversationSummaryInput - The input type for the conversationSummary function.
 * - ConversationSummaryOutput - The return type for the conversationSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationSummaryInputSchema = z.object({
  conversationText: z
    .string()
    .describe('The complete text of the conversation to be summarized.'),
  summaryType: z.enum(['curto', 'detalhado']).describe('The type of summary requested: curto (short) or detalhado (detailed).'),
});
export type ConversationSummaryInput = z.infer<typeof ConversationSummaryInputSchema>;

const ConversationSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the conversation, including key points and action items.'),
});
export type ConversationSummaryOutput = z.infer<typeof ConversationSummaryOutputSchema>;

export async function conversationSummary(input: ConversationSummaryInput): Promise<ConversationSummaryOutput> {
  return conversationSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationSummaryPrompt',
  input: {schema: ConversationSummaryInputSchema},
  output: {schema: ConversationSummaryOutputSchema},
  prompt: `Você é um especialista em resumir conversas. Dada a seguinte conversa, forneça um resumo que capture os pontos-chave e os itens de ação.

Tipo de resumo: {{summaryType}}

Conversa:
{{conversationText}}

Por favor, forneça o resumo em português do Brasil.

{{#if (eq summaryType \"curto\")}}
  Gere um resumo conciso, destacando os pontos mais importantes e as ações essenciais.
{{else}}
  Gere um resumo detalhado, incluindo todos os pontos relevantes da discussão, decisões tomadas e próximos passos acordados.
{{/if}}`,
});

const conversationSummaryFlow = ai.defineFlow(
  {
    name: 'conversationSummaryFlow',
    inputSchema: ConversationSummaryInputSchema,
    outputSchema: ConversationSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
