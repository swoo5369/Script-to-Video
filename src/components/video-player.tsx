'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ChevronLeft, ChevronRight, Video} from 'lucide-react';
import type {Segment} from '@/lib/types';

interface VideoPlayerProps {
  clips: string[];
  segments: Segment[];
}

export function VideoPlayer({clips, segments}: VideoPlayerProps) {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);

  if (!clips || clips.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentClipIndex(prev => (prev === 0 ? clips.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentClipIndex(prev => (prev === clips.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Video className="h-6 w-6 text-primary" />
          Generated Video
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative aspect-video w-full bg-black rounded-lg">
          <video
            key={clips[currentClipIndex]}
            src={clips[currentClipIndex]}
            controls
            autoPlay
            loop
            className="h-full w-full object-contain"
          />
        </div>
        <div className="text-center text-muted-foreground">
          <p className="font-semibold">
            Scene {currentClipIndex + 1} of {clips.length}
          </p>
          <p className="mt-2 italic">
            "{segments[currentClipIndex].scriptSegment}"
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={goToPrevious} variant="outline" size="lg">
            <ChevronLeft className="mr-2" /> Previous Scene
          </Button>
          <Button onClick={goToNext} variant="outline" size="lg">
            Next Scene <ChevronRight className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
