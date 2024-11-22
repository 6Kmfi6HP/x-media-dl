"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { MediaItem } from "@/lib/types";

interface PhotoGridProps {
  mediaItems: MediaItem[];
}

export function PhotoGrid({ mediaItems }: PhotoGridProps) {
  if (!mediaItems?.length) return null;

  // Filter out non-photo items and get their URLs
  const photos = mediaItems
    .filter(item => item.type === 'photo')
    .map(item => item.media_url_https || '');

  if (!photos.length) return null;

  return (
    <Card className="w-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="w-full h-auto aspect-square relative group">
            <div className="w-full h-full">
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                width={800}
                height={800}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <a
              href={photo}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all duration-200"
            >
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Download
              </span>
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}
