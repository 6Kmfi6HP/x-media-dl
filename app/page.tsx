"use client";

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { UrlForm } from '@/components/url-form';
import { MediaGrid } from '@/components/media-grid';
import { TweetInfo } from '@/components/tweet-info';
import { Toaster } from '@/components/ui/sonner';
import { MediaResponse } from '@/lib/types';
import { toast } from 'sonner';

export default function Home() {
  const [mediaInfo, setMediaInfo] = useState<MediaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialUrl, setInitialUrl] = useState('');
  const hasInitialFetch = useRef(false);

  const fetchTweetMedia = async (tweetUrl: string) => {
    setIsLoading(true);
    try {
      // Update URL in browser's address bar
      const newUrl = `${window.location.pathname}?tweet=${encodeURIComponent(tweetUrl.trim())}`;
      window.history.pushState({}, '', newUrl);
      
      const response = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: tweetUrl.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch media');
      }

      const data = await response.json();
      setMediaInfo(data);
      setInitialUrl(tweetUrl.trim());
      toast.success('Media found successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      setMediaInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get tweet URL from query parameters
    const params = new URLSearchParams(window.location.search);
    const tweetUrl = params.get('tweet');
    
    if (tweetUrl && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      setInitialUrl(tweetUrl); // Set the initial URL
      fetchTweetMedia(tweetUrl);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 border-b bg-white dark:bg-gray-950">
          <div className="container max-w-3xl mx-auto px-4 md:px-6">
            <Header />
            <div className="mt-8 md:mt-12">
              <UrlForm 
                onMediaFound={setMediaInfo} 
                isLoading={isLoading} 
                onSubmit={fetchTweetMedia}
                initialUrl={initialUrl}
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="w-full py-12">
          <div className="container max-w-3xl mx-auto px-4 md:px-6">
            {mediaInfo && (
              <div className="space-y-6">
                {mediaInfo.tweet && (
                  <TweetInfo tweet={mediaInfo.tweet} />
                )}
                <MediaGrid 
                  type={mediaInfo.type} 
                  mediaItems={mediaInfo.media_items} 
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
      <Toaster />
    </div>
  );
}