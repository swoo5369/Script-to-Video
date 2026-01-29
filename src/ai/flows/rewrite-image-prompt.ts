'use server';

/**
 * @fileOverview This file defines a Genkit flow to rewrite an image prompt based on a narration script segment.
 *
 * - rewriteImagePrompt - A function that takes a script segment and an optional style prompt, and returns a new image prompt.
 * - RewriteImagePromptInput - The input type for the rewriteImagePrompt function.
 * - RewriteImagePromptOutput - The output type for the rewriteImagePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteImagePromptInputSchema = z.object({
  scriptSegment: z.string().describe('A segment of the narration script.'),
  stylePrompt: z
    .string()
    .optional()
    .describe('A common style prompt to be appended to the image prompt.'),
});
export type RewriteImagePromptInput = z.infer<
  typeof RewriteImagePromptInputSchema
>;

const RewriteImagePromptOutputSchema = z.object({
  imagePrompt: z
    .string()
    .describe('The newly generated image prompt for the script segment.'),
});
export type RewriteImagePromptOutput = z.infer<
  typeof RewriteImagePromptOutputSchema
>;

export async function rewriteImagePrompt(
  input: RewriteImagePromptInput
): Promise<RewriteImagePromptOutput> {
  return rewriteImagePromptFlow(input);
}

const rewriteImagePromptGenkit = ai.definePrompt({
  name: 'rewriteImagePromptPrompt',
  input: {schema: RewriteImagePromptInputSchema},
  output: {schema: RewriteImagePromptOutputSchema},
  prompt: `You are an AI assistant that generates a detailed image prompt from a short narration segment.

  The image prompt should be detailed and suitable for use with AI image generation tools, including clear descriptions of subjects, actions, environments, and styles.

  {{#if stylePrompt}}
  CRITICAL: You MUST append the following style prompt to the end of the generated image prompt: ", {{{stylePrompt}}}"
  {{/if}}

  Narration Segment: {{{scriptSegment}}}
  `,
});

const rewriteImagePromptFlow = ai.defineFlow(
  {
    name: 'rewriteImagePromptFlow',
    inputSchema: RewriteImagePromptInputSchema,
    outputSchema: RewriteImagePromptOutputSchema,
  },
  async input => {
    const {output} = await rewriteImagePromptGenkit(input);
    return output!;
  }
);
