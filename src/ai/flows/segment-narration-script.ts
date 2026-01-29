'use server';

/**
 * @fileOverview This file defines a Genkit flow to segment a narration script into 5-second segments and generate image prompts for each segment.
 *
 * - segmentNarrationScript - A function that takes a narration script as input and returns an array of segmented scripts with corresponding image prompts.
 * - SegmentNarrationScriptInput - The input type for the segmentNarrationScript function.
 * - SegmentNarrationScriptOutput - The output type for the segmentNarrationScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SegmentNarrationScriptInputSchema = z.object({
  narrationScript: z
    .string()
    .describe('The complete narration script to be segmented.'),
});
export type SegmentNarrationScriptInput = z.infer<
  typeof SegmentNarrationScriptInputSchema
>;

const SegmentNarrationScriptOutputSchema = z.array(z.object({
  scriptSegment: z.string().describe('A segment of the narration script.'),
  imagePrompt: z.string().describe('An image prompt corresponding to the script segment.'),
  suggestedAiTool: z.string().optional().describe('Suggested AI tool to use for the image prompt.')
}));
export type SegmentNarrationScriptOutput = z.infer<
  typeof SegmentNarrationScriptOutputSchema
>;

export async function segmentNarrationScript(
  input: SegmentNarrationScriptInput
): Promise<SegmentNarrationScriptOutput> {
  return segmentNarrationScriptFlow(input);
}

const segmentNarrationScriptPrompt = ai.definePrompt({
  name: 'segmentNarrationScriptPrompt',
  input: {schema: SegmentNarrationScriptInputSchema},
  output: {schema: SegmentNarrationScriptOutputSchema},
  prompt: `You are an AI assistant that segments a given narration script into segments that are approximately 5 seconds long when spoken.

  For each segment, create an image prompt that accurately reflects the content of the segment.
  The image prompt should be detailed and suitable for use with AI image generation tools, including clear descriptions of subjects, actions, environments, and styles.
  Also, suggest an AI image generation tool that would be suitable for the generated prompt.

  Output the result as a JSON array of objects with the following keys:
  - scriptSegment: The segment of the narration script.
  - imagePrompt: The image prompt for the segment.
  - suggestedAiTool: Suggested AI tool to use for the image prompt.

  Narration Script: {{{narrationScript}}}
  `,
});

const segmentNarrationScriptFlow = ai.defineFlow(
  {
    name: 'segmentNarrationScriptFlow',
    inputSchema: SegmentNarrationScriptInputSchema,
    outputSchema: SegmentNarrationScriptOutputSchema,
  },
  async input => {
    const {output} = await segmentNarrationScriptPrompt(input);
    return output!;
  }
);
