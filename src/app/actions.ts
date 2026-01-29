// src/app/actions.ts
'use server';

import {segmentNarrationScript} from '@/ai/flows/segment-narration-script';
import type {SegmentNarrationScriptOutput} from '@/ai/flows/segment-narration-script';

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
