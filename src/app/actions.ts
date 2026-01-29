'use server';

import {segmentNarrationScript} from '@/ai/flows/segment-narration-script';
import type {SegmentNarrationScriptOutput} from '@/ai/flows/segment-narration-script';
import {generateImage} from '@/ai/flows/generate-image';
import type {GenerateImageOutput} from '@/ai/flows/generate-image';
import {generateVideoClips} from '@/ai/flows/generate-video-clips';
import type {GenerateVideoClipsOutput} from '@/ai/flows/generate-video-clips';
import {rewriteImagePrompt} from '@/ai/flows/rewrite-image-prompt';
import type {Segment} from '@/lib/types';

export async function generateSegments(
  narrationScript: string,
  stylePrompt: string
): Promise<SegmentNarrationScriptOutput> {
  if (!narrationScript) {
    throw new Error('Script cannot be empty.');
  }

  const segments = await segmentNarrationScript({narrationScript, stylePrompt});
  return segments;
}

export async function generateImageAction(
  prompt: string
): Promise<GenerateImageOutput> {
  const result = await generateImage({prompt});
  return result;
}

export async function rewriteImagePromptAction(
  scriptSegment: string,
  stylePrompt: string
): Promise<string> {
  const result = await rewriteImagePrompt({scriptSegment, stylePrompt});
  return result.imagePrompt;
}

export async function generateVideoAction(
  segments: Segment[],
  images: Record<number, string>
): Promise<GenerateVideoClipsOutput> {
  if (!segments.length || !Object.keys(images).length) {
    throw new Error('Segments and images are required.');
  }

  const allImagesAvailable = segments.every((_, index) => images[index]);
  if (!allImagesAvailable) {
    throw new Error('Not all images are available for video generation.');
  }

  const videoClipsInput = segments.map((segment, index) => ({
    scriptSegment: segment.scriptSegment,
    imageUrl: images[index],
  }));

  const result = await generateVideoClips(videoClipsInput);
  return result;
}
