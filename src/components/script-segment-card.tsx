'use client';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {Copy, Bot} from 'lucide-react';
import type {Segment} from '@/lib/types';

interface ScriptSegmentCardProps {
  segment: Segment;
  index: number;
  onPromptChange: (index: number, newPrompt: string) => void;
}

export function ScriptSegmentCard({
  segment,
  index,
  onPromptChange,
}: ScriptSegmentCardProps) {
  const {toast} = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(segment.imagePrompt);
    toast({
      title: 'Copied!',
      description: 'Image prompt copied to clipboard.',
    });
  };

  const imageHint = segment.imagePrompt.split(' ').slice(0, 2).join(' ');

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="grid items-start gap-6 p-6 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-video w-full">
          <Image
            src={`https://picsum.photos/seed/${index + 1}/600/338`}
            alt={segment.imagePrompt}
            width={600}
            height={338}
            className="rounded-lg border object-cover"
            data-ai-hint={imageHint}
            priority={index < 3} // Prioritize loading first few images
          />
        </div>

        <div className="grid gap-4">
          <div>
            <Label className="text-sm font-semibold text-muted-foreground">
              Scene {index + 1} - Narration
            </Label>
            <p className="mt-1 text-foreground">{segment.scriptSegment}</p>
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
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy prompt</span>
              </Button>
            </div>
          </div>

          {segment.suggestedAiTool && (
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              <Badge
                variant="outline"
                className="border-accent/50 bg-accent/10 font-semibold text-accent"
              >
                Suggested Tool: {segment.suggestedAiTool}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
