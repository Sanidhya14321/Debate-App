'use server';

/**
 * @fileOverview A flow to generate AI-powered feedback for a debate.
 *
 * - generateDebateFeedback - A function that generates feedback for a debate.
 * - GenerateDebateFeedbackInput - The input type for the generateDebateFeedback function.
 * - GenerateDebateFeedbackOutput - The return type for the generateDebateFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDebateFeedbackInputSchema = z.object({
  debateSummary: z.string().describe('A summary of the debate.'),
  debaterAArguments: z.string().describe('A summary of Debater A\s arguments.'),
  debaterBArguments: z.string().describe('A summary of Debater B\s arguments.'),
  winnerName: z.string().describe('The name of the debate winner.'),
});
export type GenerateDebateFeedbackInput = z.infer<typeof GenerateDebateFeedbackInputSchema>;

const GenerateDebateFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the debate outcome.'),
  suggestions: z.string().describe('Suggestions for improvement for both debaters.'),
});
export type GenerateDebateFeedbackOutput = z.infer<typeof GenerateDebateFeedbackOutputSchema>;

export async function generateDebateFeedback(
  input: GenerateDebateFeedbackInput
): Promise<GenerateDebateFeedbackOutput> {
  return generateDebateFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDebateFeedbackPrompt',
  input: {schema: GenerateDebateFeedbackInputSchema},
  output: {schema: GenerateDebateFeedbackOutputSchema},
  prompt: `You are an AI debate judge providing feedback on a debate.

  Debate Summary: {{{debateSummary}}}
  Debater A's Arguments: {{{debaterAArguments}}}
  Debater B's Arguments: {{{debaterBArguments}}}
  Winner: {{{winnerName}}}

  Provide a summary of the debate outcome, highlighting key arguments from each debater.
  Then, provide suggestions for improvement for both debaters.
`,
});

const generateDebateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateDebateFeedbackFlow',
    inputSchema: GenerateDebateFeedbackInputSchema,
    outputSchema: GenerateDebateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
