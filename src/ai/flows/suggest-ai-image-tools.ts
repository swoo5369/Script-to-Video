// src/ai/flows/suggest-ai-image-tools.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests suitable AI image generation tools
 * based on the provided image generation prompt.
 *
 * - suggestAiImageTools - A function that suggests AI image generation tools based on the prompt.
 * - SuggestAiImageToolsInput - The input type for the suggestAiImageTools function.
 * - SuggestAiImageToolsOutput - The return type for the suggestAiImageTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAiImageToolsInputSchema = z.object({
  prompt: z
    .string()
    .describe('The image generation prompt to analyze and suggest tools for.'),
});
export type SuggestAiImageToolsInput = z.infer<typeof SuggestAiImageToolsInputSchema>;

const SuggestAiImageToolsOutputSchema = z.object({
  suggestedTools: z
    .array(z.string())
    .describe('An array of suggested AI image generation tools.'),
});
export type SuggestAiImageToolsOutput = z.infer<typeof SuggestAiImageToolsOutputSchema>;

export async function suggestAiImageTools(input: SuggestAiImageToolsInput): Promise<SuggestAiImageToolsOutput> {
  return suggestAiImageToolsFlow(input);
}

const suggestAiImageToolsPrompt = ai.definePrompt({
  name: 'suggestAiImageToolsPrompt',
  input: {schema: SuggestAiImageToolsInputSchema},
  output: {schema: SuggestAiImageToolsOutputSchema},
  prompt: `You are an expert in AI image generation tools. Given the following prompt, suggest a list of suitable AI image generation tools that could be used to generate images from it. The response should be an array of strings.

Prompt: {{{prompt}}} `,
});

const suggestAiImageToolsFlow = ai.defineFlow(
  {
    name: 'suggestAiImageToolsFlow',
    inputSchema: SuggestAiImageToolsInputSchema,
    outputSchema: SuggestAiImageToolsOutputSchema,
  },
  async input => {
    const {output} = await suggestAiImageToolsPrompt(input);
    return output!;
  }
);
