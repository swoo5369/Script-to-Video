'use server';

/**
 * @fileOverview Generates image prompts for each segment of a given script.
 *
 * - generateImagePrompts - A function that accepts a script and returns an array of image prompts.
 * - GenerateImagePromptsInput - The input type for the generateImagePrompts function.
 * - GenerateImagePromptsOutput - The return type for the generateImagePrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImagePromptsInputSchema = z.object({
  script: z
    .string()
    .describe('The narration script to generate image prompts for.'),
});
export type GenerateImagePromptsInput = z.infer<
  typeof GenerateImagePromptsInputSchema
>;

const GenerateImagePromptsOutputSchema = z.array(z.string());
export type GenerateImagePromptsOutput = z.infer<
  typeof GenerateImagePromptsOutputSchema
>;

export async function generateImagePrompts(
  input: GenerateImagePromptsInput
): Promise<GenerateImagePromptsOutput> {
  return generateImagePromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImagePromptsPrompt',
  input: {schema: GenerateImagePromptsInputSchema},
  output: {schema: GenerateImagePromptsOutputSchema},
  prompt: `You are an AI assistant that helps generate image prompts for a given narration script.

  Your task is to take the input script and generate a list of detailed and descriptive image prompts.
  Each prompt should accurately reflect the content of a segment of the script, suitable for use with AI image generation tools.
  The prompts should include clear descriptions of subjects, actions, environments, and styles.

  Input Script: {{{script}}}

  Output Image Prompts: A JSON array of strings, each string representing an image prompt for a script segment.
  `,
});

const generateImagePromptsFlow = ai.defineFlow(
  {
    name: 'generateImagePromptsFlow',
    inputSchema: GenerateImagePromptsInputSchema,
    outputSchema: GenerateImagePromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
