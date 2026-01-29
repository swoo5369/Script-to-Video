'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {
  generateSegments,
  generateImageAction,
  generateVideoAction,
  type GenerateImageActionResult,
} from './actions';
import type {Segment} from '@/lib/types';
import {ScriptSegmentCard} from '@/components/script-segment-card';
import {Skeleton} from '@/components/ui/skeleton';
import {Logo} from '@/components/logo';
import {Wand2, Clapperboard, RefreshCw, Camera} from 'lucide-react';
import {VideoPlayer} from '@/components/video-player';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';

export default function ShortsAIScriptPage() {
  const [script, setScript] = useState('');
  const [stylePrompt, setStylePrompt] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    Record<number, GenerateImageActionResult>
  >({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [videoClips, setVideoClips] = useState<string[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const {toast} = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!script.trim() || isLoading) return;

    setIsLoading(true);
    setSegments([]);
    setGeneratedImages({});
    setVideoClips([]);

    try {
      const result = await generateSegments(script, stylePrompt);
      setSegments(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Failed to generate script segments. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (index: number, newPrompt: string) => {
    setSegments(prevSegments =>
      prevSegments.map((segment, i) =>
        i === index ? {...segment, imagePrompt: newPrompt} : segment
      )
    );
  };

  const handleScriptChange = (index: number, newScript: string) => {
    setSegments(prevSegments =>
      prevSegments.map((segment, i) =>
        i === index ? {...segment, scriptSegment: newScript} : segment
      )
    );
  };

  const handleImageGenerated = (
    index: number,
    imageResult: GenerateImageActionResult
  ) => {
    setGeneratedImages(prev => ({...prev, [index]: imageResult}));
  };

  const handleGenerateAllImages = async () => {
    if (segments.length === 0) return;

    setIsGeneratingAll(true);
    const promises: Promise<{
      index: number;
      imageResult: GenerateImageActionResult;
    } | null>[] = [];

    segments.forEach((segment, index) => {
      if (!generatedImages[index] && segment.imagePrompt) {
        promises.push(
          generateImageAction(segment.imagePrompt)
            .then(result => ({
              index,
              imageResult: result,
            }))
            .catch(err => {
              console.error(`Failed to generate image for segment ${index}`, err);
              toast({
                variant: 'destructive',
                title: `Error for Scene ${index + 1}`,
                description: 'Image generation failed.',
              });
              return null; // Don't let one failure stop all
            })
        );
      }
    });

    if (promises.length === 0) {
      setIsGeneratingAll(false);
      toast({title: 'All images already generated.'});
      return;
    }

    try {
      const results = await Promise.all(promises);

      const newImages = results.reduce((acc, result) => {
        if (result) {
          acc[result.index] = result.imageResult;
        }
        return acc;
      }, {} as Record<number, GenerateImageActionResult>);

      setGeneratedImages(prev => ({...prev, ...newImages}));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Images',
        description: 'One or more images failed to generate. Please try again.',
      });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const allImagesGenerated =
    segments.length > 0 && Object.keys(generatedImages).length === segments.length;

  const handleGenerateVideo = async () => {
    if (!allImagesGenerated || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoClips([]);

    try {
      const imageIds = Object.fromEntries(
        Object.entries(generatedImages).map(([index, {imageId}]) => [
          index,
          imageId,
        ])
      );
      const result = await generateVideoAction(segments, imageIds, aspectRatio);
      setVideoClips(result.map(clip => clip.videoUrl));
      toast({
        title: 'Video Generated!',
        description: 'Your video clips have been created successfully.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Video',
        description: 'Failed to generate video clips. Please try again.',
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Logo />
        <h1 className="text-xl font-semibold text-foreground font-headline">
          Shorts AI Script
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto grid max-w-4xl gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Wand2 className="h-6 w-6 text-primary" />
                Start with Your Script
              </CardTitle>
              <CardDescription>
                Paste your narration script below. We'll break it down into short
                segments and generate matching image prompts for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <Textarea
                  placeholder="In a world where visuals speak louder than words, one tool is about to change everything..."
                  value={script}
                  onChange={e => setScript(e.target.value)}
                  rows={8}
                  className="resize-none text-base"
                  disabled={isLoading}
                />
                <div className="grid gap-2">
                  <Label htmlFor="style-prompt" className="font-semibold">
                    Common Style Prompt (Optional)
                  </Label>
                  <Textarea
                    id="style-prompt"
                    placeholder="e.g., cinematic, 4k, hyperrealistic, anime style"
                    value={stylePrompt}
                    onChange={e => setStylePrompt(e.target.value)}
                    rows={2}
                    className="mt-1 resize-none"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    This prompt will be added to every generated image prompt to
                    maintain a consistent style.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!script.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2" />
                        {segments.length > 0
                          ? 'Regenerate Script'
                          : 'Generate Script'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="grid gap-6">
              <h2 className="text-2xl font-bold tracking-tight font-headline">
                Crafting your script...
              </h2>
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="grid gap-6 p-6">
                      <Skeleton className="w-full rounded-lg aspect-video" />
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                        <div className="grid gap-2">
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isLoading && segments.length > 0 && (
            <div className="grid gap-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold tracking-tight font-headline">
                  Your AI-Powered Storyboard
                </h2>
                <div className="flex flex-wrap items-center justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Aspect Ratio</Label>
                    <RadioGroup
                      value={aspectRatio}
                      onValueChange={setAspectRatio}
                      className="flex items-center gap-4"
                      disabled={isGeneratingVideo || isGeneratingAll}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="16:9" id="r1" />
                        <Label htmlFor="r1" className="cursor-pointer">
                          Landscape
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="9:16" id="r2" />
                        <Label htmlFor="r2" className="cursor-pointer">
                          Portrait
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleGenerateAllImages}
                      disabled={isGeneratingAll || segments.length === 0}
                    >
                      {isGeneratingAll ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating Images...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2" />
                          Generate All Images
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleGenerateVideo}
                      disabled={
                        !allImagesGenerated ||
                        isGeneratingAll ||
                        isGeneratingVideo
                      }
                    >
                      {isGeneratingVideo ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating Video...
                        </>
                      ) : (
                        <>
                          <Clapperboard className="mr-2" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-6">
                {segments.map((segment, index) => (
                  <ScriptSegmentCard
                    key={index}
                    segment={segment}
                    index={index}
                    onPromptChange={handlePromptChange}
                    onScriptChange={handleScriptChange}
                    generatedImage={generatedImages[index]}
                    onImageGenerated={handleImageGenerated}
                    isGeneratingAll={isGeneratingAll}
                    stylePrompt={stylePrompt}
                    aspectRatio={aspectRatio}
                  />
                ))}
              </div>
            </div>
          )}

          {!isLoading && videoClips.length > 0 && (
            <div className="grid gap-6">
              <VideoPlayer
                clips={videoClips}
                segments={segments}
                aspectRatio={aspectRatio}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Created with{' '}
          <a
            href="https://firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Shorts AI Script
          </a>
        </p>
      </footer>
    </div>
  );
}
