'use client';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {Copy, Camera, RefreshCw} from 'lucide-react';
import type {Segment} from '@/lib/types';
import {generateImageAction} from '@/app/actions';
import {useState} from 'react';

interface ScriptSegmentCardProps {
  segment: Segment;
  index: number;
  onPromptChange: (index: number, newPrompt: string) => void;
  onScriptChange: (index: number, newScript: string) => void;
  generatedImageUrl?: string;
  onImageGenerated: (index: number, imageUrl: string) => void;
  isGeneratingAll: boolean;
}

export function ScriptSegmentCard({
  segment,
  index,
  onPromptChange,
  onScriptChange,
  generatedImageUrl,
  onImageGenerated,
  isGeneratingAll,
}: ScriptSegmentCardProps) {
  const {toast} = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    try {
      const result = await generateImageAction(segment.imagePrompt);
      onImageGenerated(index, result.imageUrl);
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

  const imageHint = segment.imagePrompt.split(' ').slice(0, 2).join(' ');
  const isCurrentlyGenerating =
    isGeneratingImage || (isGeneratingAll && !generatedImageUrl);

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="grid items-start gap-6 p-6 md:grid-cols-[1fr_300px]">
        <div className="grid gap-4">
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
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor={`prompt-${index}`}
              className="text-sm font-semibold text-muted-foreground"
            >
              Image Prompt
            </Label>
            <div className="relative">
              <Textarea
                id={`prompt-${index}`}
                value={segment.imagePrompt}
                onChange={e => onPromptChange(index, e.target.value)}
                rows={4}
                className="pr-12 resize-none"
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
        <div className="relative aspect-video w-full">
          {isCurrentlyGenerating ? (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-muted/50">
              <RefreshCw className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="font-medium text-muted-foreground">
                Generating image...
              </p>
            </div>
          ) : generatedImageUrl ? (
            <Image
              src={generatedImageUrl}
              alt={segment.imagePrompt}
              width={600}
              height={338}
              className="rounded-lg border object-cover"
              data-ai-hint={imageHint}
            />
          ) : (
            <Image
              src={`https://picsum.photos/seed/${index + 1}/600/338`}
              alt="Placeholder"
              width={600}
              height={338}
              className="rounded-lg border object-cover"
              data-ai-hint={imageHint}
              priority={index < 3}
            />
          )}

          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button
              size="sm"
              onClick={handleGenerateImage}
              disabled={isCurrentlyGenerating}
            >
              {isCurrentlyGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : generatedImageUrl ? (
                <>
                  <RefreshCw className="mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Camera className="mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
