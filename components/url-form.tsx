'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MediaResponse } from '@/lib/types';

interface UrlFormProps {
  onMediaFound: (media: MediaResponse) => void;
  isLoading?: boolean;
  onSubmit: (url: string) => Promise<void>;
  initialUrl?: string;
}

export function UrlForm({ 
  onMediaFound, 
  isLoading = false, 
  onSubmit,
  initialUrl = ''
}: UrlFormProps) {
  const [url, setUrl] = useState(initialUrl);

  // Update URL when initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a valid X (Twitter) URL');
      return;
    }

    await onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Paste X (Twitter) URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-12 px-4 text-base"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="h-12 px-8 text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Download'
          )}
        </Button>
      </div>
    </form>
  );
}
