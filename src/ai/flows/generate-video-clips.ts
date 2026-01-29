'use server';

/**
 * @fileOverview Generates video clips from script segments and images.
 * - generateVideoClips - A function that accepts script segments and corresponding images and returns video clips.
 * - GenerateVideoClipsInput - The input type for the generateVideoClips function.
 * - GenerateVideoClipsOutput - The return type for the generateVideoClips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoClipsInputSchema = z.array(
  z.object({
    scriptSegment: z.string(),
    imageUrl: z.string(),
  })
);
export type GenerateVideoClipsInput = z.infer<
  typeof GenerateVideoClipsInputSchema
>;

const GenerateVideoClipsOutputSchema = z.array(
  z.object({
    videoUrl: z.string().describe('The data URI of the generated video clip.'),
  })
);
export type GenerateVideoClipsOutput = z.infer<
  typeof GenerateVideoClipsOutputSchema
>;

async function getBase64VideoFromPart(videoPart: any): Promise<string> {
  const media = videoPart.media;
  if (!media?.url) {
    throw new Error('Video media URL is missing');
  }

  const fetchUrl = media.url.includes('key=')
    ? media.url
    : `${media.url}&key=${process.env.GEMINI_API_KEY}`;

  const videoResponse = await fetch(fetchUrl);

  if (!videoResponse.ok || !videoResponse.body) {
    const errorBody = await videoResponse.text();
    throw new Error(
      `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}. Body: ${errorBody}`
    );
  }

  const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
  const contentType =
    media.contentType ||
    videoResponse.headers.get('content-type') ||
    'video/mp4';

  return `data:${contentType};base64,${videoBuffer.toString('base64')}`;
}

export async function generateVideoClips(
  input: GenerateVideoClipsInput
): Promise<GenerateVideoClipsOutput> {
  return generateVideoClipsFlow(input);
}

const generateVideoClipsFlow = ai.defineFlow(
  {
    name: 'generateVideoClipsFlow',
    inputSchema: GenerateVideoClipsInputSchema,
    outputSchema: GenerateVideoClipsOutputSchema,
  },
  async segments => {
    const operationPromises = segments.map(segment => {
      const mimeType = segment.imageUrl.substring(
        segment.imageUrl.indexOf(':') + 1,
        segment.imageUrl.indexOf(';')
      );
      return ai.generate({
        model: 'googleai/veo-2.0-generate-001',
        prompt: [
          {
            text: `Animate this image based on the following narration. The animation should be subtle and match the tone of the narration. Narration: "${segment.scriptSegment}"`,
          },
          {
            media: {
              contentType: mimeType,
              url: segment.imageUrl,
            },
          },
        ],
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });
    });

    const initialResponses = await Promise.all(operationPromises);
    let operations = initialResponses.map(res => res.operation);

    while (operations.some(op => op && !op.done)) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const checkPromises = operations.map(op => {
        if (!op || op.done) return Promise.resolve(op);
        return ai.checkOperation(op);
      });

      operations = await Promise.all(checkPromises);
    }

    const videoUrlPromises = operations.map(op => {
      if (!op || op.error) {
        console.error('Video generation failed:', op?.error?.message);
        throw new Error(
          `Video generation failed: ${op?.error?.message || 'Unknown error'}`
        );
      }
      const videoPart = op.output?.message?.content.find((p: any) => !!p.media);
      if (!videoPart) {
        throw new Error('Failed to find the generated video in operation result');
      }
      return getBase64VideoFromPart(videoPart);
    });

    const videoUrls = await Promise.all(videoUrlPromises);

    return videoUrls.map(url => ({videoUrl: url}));
  }
);
