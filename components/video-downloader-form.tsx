"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MediaResponse } from '@/lib/types';
import { getMediaInfo } from '@/lib/twitter-api';

interface MediaDownloaderFormProps {
  onMediaFound: (media: MediaResponse) => void;
}

export function MediaDownloaderForm({ onMediaFound }: MediaDownloaderFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const media = await getMediaInfo(url);
      onMediaFound(media);
      toast.success(`${media.type === 'video' ? 'Video variants' : 'Photos'} found!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch media');
      onMediaFound({
        type: 'video',
        media_items: [],
        tweet: {
          id: '',
          text: '',
          created_at: '',
          user: {
            name: '',
            screen_name: '',
            profile_image_url: '',
            is_blue_verified: false
          },
          reply_count: 0,
          retweet_count: 0,
          quote_count: 0,
          favorite_count: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste Twitter/X post URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              'Get Media'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}