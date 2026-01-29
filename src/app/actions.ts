'use server';

import {segmentNarrationScript} from '@/ai/flows/segment-narration-script';
import type {SegmentNarrationScriptOutput} from '@/ai/flows/segment-narration-script';
import {generateImage} from '@/ai/flows/generate-image';
import type {GenerateImageOutput} from '@/ai/flows/generate-image';

export async function generateSegments(
  narrationScript: string
): Promise<SegmentNarrationScriptOutput> {
  if (!narrationScript) {
    throw new Error('Script cannot be empty.');
  }

  try {
    const segments = await segmentNarrationScript({narrationScript});
    return segments;
  } catch (error) {
    console.error('Error in generateSegments action:', error);
    // Throw a more generic error to the client
    throw new Error('Failed to process script with the AI model.');
  }
}

export async function generateImageAction(
  prompt: string
): Promise<GenerateImageOutput> {
  if (!prompt) {
    throw new Error('Prompt cannot be empty.');
  }

  try {
    const result = await generateImage({prompt});
    return result;
  } catch (error) {
    console.error('Error in generateImageAction:', error);
    throw new Error('Failed to generate image with the AI model.');
  }
}
