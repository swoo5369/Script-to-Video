'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ChevronLeft, ChevronRight, Video, Download} from 'lucide-react';
import type {Segment} from '@/lib/types';
import {useToast} from '@/hooks/use-toast';

interface VideoPlayerProps {
  clips: string[];
  segments: Segment[];
  aspectRatio: string;
}

export function VideoPlayer({clips, segments, aspectRatio}: VideoPlayerProps) {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const {toast} = useToast();

  if (!clips || clips.length === 0) {
    return null;
  }

  const downloadDataUri = (dataUri: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToPrevious = () => {
    setCurrentClipIndex(prev => (prev === 0 ? clips.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentClipIndex(prev => (prev === clips.length - 1 ? 0 : prev + 1));
  };

  const handleDownloadCurrentClip = () => {
    downloadDataUri(
      clips[currentClipIndex],
      `video-scene-${currentClipIndex + 1}.mp4`
    );
  };

  const handleDownloadAllClips = () => {
    toast({
      title: 'Downloading All Clips',
      description: `Starting download for ${clips.length} video clips.`,
    });
    clips.forEach((clip, index) => {
      setTimeout(() => {
        downloadDataUri(clip, `video-scene-${index + 1}.mp4`);
      }, index * 500); // Stagger downloads slightly
    });
  };
  const isPortrait = aspectRatio === '9:16';

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-headline">
          <Video className="h-6 w-6 text-primary" />
          Generated Video
        </CardTitle>
        <Button onClick={handleDownloadAllClips} variant="outline">
          <Download className="mr-2" />
          Download Full Video
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div
          className="relative w-full bg-black rounded-lg mx-auto"
          style={{aspectRatio: isPortrait ? '9 / 16' : '16 / 9'}}
        >
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
          <Button
            onClick={handleDownloadCurrentClip}
            variant="secondary"
            size="lg"
          >
            <Download className="mr-2" /> Download Clip
          </Button>
          <Button onClick={goToNext} variant="outline" size="lg">
            Next Scene <ChevronRight className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
