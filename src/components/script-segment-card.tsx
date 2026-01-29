'use client';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {Copy, Camera, RefreshCw, Download, Video} from 'lucide-react';
import type {Segment} from '@/lib/types';
import {
  generateImageAction,
  rewriteImagePromptAction,
  generateSingleVideoClipAction,
  type GenerateImageActionResult,
} from '@/app/actions';
import {useState} from 'react';

interface ScriptSegmentCardProps {
  segment: Segment;
  index: number;
  onPromptChange: (index: number, newPrompt: string) => void;
  onScriptChange: (index: number, newScript: string) => void;
  generatedImage?: GenerateImageActionResult;
  onImageGenerated: (index: number, imageResult: GenerateImageActionResult) => void;
  isGeneratingAll: boolean;
  stylePrompt: string;
  aspectRatio: string;
}

export function ScriptSegmentCard({
  segment,
  index,
  onPromptChange,
  onScriptChange,
  generatedImage,
  onImageGenerated,
  isGeneratingAll,
  stylePrompt,
  aspectRatio,
}: ScriptSegmentCardProps) {
  const {toast} = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRewritingPrompt, setIsRewritingPrompt] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(segment.imagePrompt);
    toast({
      title: 'Copied!',
      description: 'Image prompt copied to clipboard.',
    });
  };

  const handleGenerateImage = async () => {
    if (!segment.imagePrompt) {
      toast({
        variant: 'destructive',
        title: 'Empty Prompt',
        description: 'Cannot generate an image from an empty prompt.',
      });
      return;
    }
    setIsGeneratingImage(true);
    setGeneratedVideoUrl(null); // Reset video when generating a new image
    try {
      const result = await generateImageAction(segment.imagePrompt);
      onImageGenerated(index, result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating image',
        description: 'Please try again.',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRewritePrompt = async () => {
    setIsRewritingPrompt(true);
    try {
      const newPrompt = await rewriteImagePromptAction(
        segment.scriptSegment,
        stylePrompt
      );
      onPromptChange(index, newPrompt);
      toast({
        title: 'Prompt Rewritten!',
        description: 'The image prompt has been updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error rewriting prompt',
        description: 'Please try again.',
      });
    } finally {
      setIsRewritingPrompt(false);
    }
  };

  const downloadDataUri = (dataUri: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadImage = () => {
    if (!generatedImage?.imageUrl) return;
    downloadDataUri(
      generatedImage.imageUrl,
      `scene-${index + 1}-image.png`
    );
    toast({
      title: 'Download Started',
      description: 'Your image is being downloaded.',
    });
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    downloadDataUri(generatedVideoUrl, `scene-${index + 1}-video.mp4`);
    toast({
      title: 'Download Started',
      description: 'Your video clip is being downloaded.',
    });
  };

  const handleGenerateVideoClip = async () => {
    if (!generatedImage?.imageId) {
      toast({
        variant: 'destructive',
        title: 'Image not available',
        description: 'Please generate the image first.',
      });
      return;
    }
    setIsGeneratingVideo(true);
    try {
      const videoUrl = await generateSingleVideoClipAction(
        segment,
        generatedImage.imageId,
        aspectRatio
      );
      setGeneratedVideoUrl(videoUrl);
      toast({
        title: 'Video Clip Generated!',
        description: 'Your video clip for this scene is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Video Clip',
        description: 'Failed to generate the video clip. Please try again.',
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const generatedImageUrl = generatedImage?.imageUrl;
  const imageHint = segment.imagePrompt.split(' ').slice(0, 2).join(' ');
  const isCurrentlyGeneratingImage =
    isGeneratingImage || (isGeneratingAll && !generatedImageUrl);
  const isImageReady = !!generatedImageUrl;
  const isVideoReady = !!generatedVideoUrl;
  const isPortrait = aspectRatio === '9:16';

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="grid gap-6">
          <div
            className="relative w-full mx-auto"
            style={{aspectRatio: isPortrait ? '9 / 16' : '16 / 9'}}
          >
            {isGeneratingVideo ? (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-muted/50">
                <RefreshCw className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="font-medium text-muted-foreground">
                  Generating video clip...
                </p>
              </div>
            ) : isVideoReady ? (
              <>
                <video
                  key={generatedVideoUrl}
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="h-full w-full rounded-lg border object-contain"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownloadVideo}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Clip
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateVideoClip}
                    disabled={isGeneratingVideo}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
                </div>
              </>
            ) : isCurrentlyGeneratingImage ? (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-muted/50">
                <RefreshCw className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="font-medium text-muted-foreground">
                  Generating image...
                </p>
              </div>
            ) : isImageReady ? (
              <>
                <Image
                  src={generatedImageUrl}
                  alt={segment.imagePrompt}
                  fill
                  className="rounded-lg border object-cover"
                  data-ai-hint={imageHint}
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownloadImage}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateImage}
                    disabled={isCurrentlyGeneratingImage}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleGenerateVideoClip}
                    disabled={isGeneratingVideo}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Generate Clip
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50">
                <Button
                  size="lg"
                  onClick={handleGenerateImage}
                  disabled={isCurrentlyGeneratingImage}
                >
                  <Camera className="mr-2" />
                  Generate Image
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label
                htmlFor={`script-${index}`}
                className="text-sm font-semibold text-muted-foreground"
              >
                Scene {index + 1} - Narration
              </Label>
              <Textarea
                id={`script-${index}`}
                value={segment.scriptSegment}
                onChange={e => onScriptChange(index, e.target.value)}
                rows={5}
                className="mt-1 resize-none"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`prompt-${index}`}
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Image Prompt
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRewritePrompt}
                  disabled={isRewritingPrompt}
                >
                  {isRewritingPrompt ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Rewrite
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  id={`prompt-${index}`}
                  value={segment.imagePrompt}
                  onChange={e => onPromptChange(index, e.target.value)}
                  rows={5}
                  className="pr-12 resize-none mt-1"
                  disabled={isRewritingPrompt}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleCopy}
                  aria-label="Copy prompt"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy prompt</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
