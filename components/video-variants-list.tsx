"use client";

import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MediaItem } from '@/lib/types';

interface VideoVariantsListProps {
  mediaItems?: MediaItem[];
}

export function VideoVariantsList({ mediaItems = [] }: VideoVariantsListProps) {
  if (!mediaItems?.length) {
    return null;
  }

  const downloadVideo = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Video downloaded successfully');
    } catch (error) {
      console.error('Failed to download video:', error);
      toast.error('Failed to download video');
    }
  };

  const VideoCard = ({ item, index }: { item: MediaItem; index: number }) => {
    const variants = item.variants?.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0)) || [];
    const previewVariant = variants[0];

    if (!previewVariant) {
      return null;
    }

    return (
      <Card className="w-full p-6">
        <div className="space-y-4">
          {mediaItems.length > 1 && (
            <h3 className="text-lg font-semibold">Video {index + 1}</h3>
          )}
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <video 
              src={previewVariant.url}
              poster={item.media_url_https}
              controls
              preload="metadata"
              className="w-full h-full"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Download Options:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {variants.map((variant, variantIndex) => (
                <Button
                  key={variantIndex}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => downloadVideo(variant.url)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {variant.bitrate ? `${Math.round(variant.bitrate / 1000)}K` : 'Download'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Use grid only when there are multiple videos
  return mediaItems.length > 1 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mediaItems.map((item, index) => (
        <VideoCard key={index} item={item} index={index} />
      ))}
    </div>
  ) : (
    <VideoCard item={mediaItems[0]} index={0} />
  );
}