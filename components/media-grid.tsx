"use client";

import { MediaItem } from "@/lib/types";
import { PhotoGrid } from "./photo-grid";
import { VideoVariantsList } from "./video-variants-list";

interface MediaGridProps {
  type: 'video' | 'photo' | 'mixed';
  mediaItems: MediaItem[];
}

export function MediaGrid({ type, mediaItems }: MediaGridProps) {
  if (!mediaItems?.length) return null;

  const photos = mediaItems.filter(item => item.type === 'photo');
  const videos = mediaItems.filter(item => item.type === 'video');

  return (
    <div className="space-y-6">
      {/* Show photos if type is photo or mixed */}
      {(type === 'photo' || type === 'mixed') && photos.length > 0 && (
        <div>
          {type === 'mixed' && <h2 className="text-xl font-semibold mb-4">Photos</h2>}
          <PhotoGrid mediaItems={photos} />
        </div>
      )}

      {/* Show videos if type is video or mixed */}
      {(type === 'video' || type === 'mixed') && videos.length > 0 && (
        <div>
          {type === 'mixed' && <h2 className="text-xl font-semibold mb-4">Videos</h2>}
          <VideoVariantsList mediaItems={videos} />
        </div>
      )}
    </div>
  );
}
