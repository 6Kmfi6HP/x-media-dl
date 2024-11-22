"use client";

import type { TweetInfo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface TweetInfoProps {
  tweet: TweetInfo;
}

export function TweetInfo({ tweet }: TweetInfoProps) {
  const formattedDate = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true });

  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src={tweet.user.profile_image_url.replace('_normal.', '.')}
            alt={tweet.user.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {tweet.user.name}
            </p>
            {tweet.user.is_blue_verified && (
              <span className="text-blue-500">✓</span>
            )}
            <span className="text-sm text-gray-500">@{tweet.user.screen_name}</span>
            <span className="text-sm text-gray-500">·</span>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {tweet.text}
          </p>
          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
            <span>{tweet.reply_count.toLocaleString()} replies</span>
            <span>{tweet.retweet_count.toLocaleString()} retweets</span>
            <span>{tweet.quote_count.toLocaleString()} quotes</span>
            <span>{tweet.favorite_count.toLocaleString()} likes</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
