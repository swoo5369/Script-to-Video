'use server';

import {promises as fs} from 'fs';
import path from 'path';
import os from 'os';
import {v4 as uuidv4} from 'uuid';
import {segmentNarrationScript} from '@/ai/flows/segment-narration-script';
import type {SegmentNarrationScriptOutput} from '@/ai/flows/segment-narration-script';
import {generateImage} from '@/ai/flows/generate-image';
import {generateVideoClips} from '@/ai/flows/generate-video-clips';
import type {GenerateVideoClipsOutput} from '@/ai/flows/generate-video-clips';
import {rewriteImagePrompt} from '@/ai/flows/rewrite-image-prompt';
import type {Segment} from '@/lib/types';

export type GenerateImageActionResult = {
  imageUrl: string;
  imageId: string;
};

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
): Promise<GenerateImageActionResult> {
  const result = await generateImage({prompt});
  const imageUrl = result.imageUrl;

  const imageId = uuidv4() + '.txt';
  const tempDir = path.join(os.tmpdir(), 'shorts-ai-script');
  await fs.mkdir(tempDir, {recursive: true});
  const filePath = path.join(tempDir, imageId);
  await fs.writeFile(filePath, imageUrl);

  return {imageUrl, imageId};
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
  imageIds: Record<number, string>
): Promise<GenerateVideoClipsOutput> {
  if (!segments.length || !Object.keys(imageIds).length) {
    throw new Error('Segments and images are required.');
  }

  const allImagesAvailable = segments.every((_, index) => imageIds[index]);
  if (!allImagesAvailable) {
    throw new Error('Not all images are available for video generation.');
  }

  const videoClipsInput = await Promise.all(
    segments.map(async (segment, index) => {
      const imageId = imageIds[index];
      const tempDir = path.join(os.tmpdir(), 'shorts-ai-script');
      const filePath = path.join(tempDir, imageId);
      const imageUrl = await fs.readFile(filePath, 'utf-8');

      return {
        scriptSegment: segment.scriptSegment,
        imageUrl: imageUrl,
      };
    })
  );

  const result = await generateVideoClips(videoClipsInput);

  await Promise.all(
    Object.values(imageIds).map(async imageId => {
      const tempDir = path.join(os.tmpdir(), 'shorts-ai-script');
      const filePath = path.join(tempDir, imageId);
      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.warn(`Failed to delete temp file ${filePath}`, e);
      }
    })
  );

  return result;
}

export async function generateSingleVideoClipAction(
  segment: Segment,
  imageId: string
): Promise<string> {
  if (!segment || !imageId) {
    throw new Error('Segment and image ID are required.');
  }

  const tempDir = path.join(os.tmpdir(), 'shorts-ai-script');
  const filePath = path.join(tempDir, imageId);
  const imageUrl = await fs.readFile(filePath, 'utf-8');

  const videoClipsInput = [
    {
      scriptSegment: segment.scriptSegment,
      imageUrl: imageUrl,
    },
  ];

  const result = await generateVideoClips(videoClipsInput);

  if (!result || result.length === 0 || !result[0].videoUrl) {
    throw new Error('Video clip generation failed.');
  }

  return result[0].videoUrl;
}
