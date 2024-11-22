export interface VideoVariant {
  bitrate?: number;
  content_type: string;
  url: string;
}

export interface VideoInfo {
  variants: VideoVariant[];
  duration_millis: number;
  aspect_ratio: [number, number];
}

export interface MediaItem {
  type: 'video' | 'photo';
  url: string;
  variants?: VideoVariant[];
  duration_millis?: number;
  aspect_ratio?: [number, number];
  media_url_https?: string;
  sizes?: {
    [key: string]: {
      h: number;
      w: number;
      resize: string;
    }
  };
}

export interface TwitterUser {
  name: string;
  screen_name: string;
  profile_image_url: string;
  is_blue_verified: boolean;
  description?: string;
  followers_count?: number;
  following_count?: number;
}

export interface TweetInfo {
  id: string;
  text: string;
  created_at: string;
  user: TwitterUser;
  reply_count: number;
  retweet_count: number;
  quote_count: number;
  favorite_count: number;
  view_count?: number;
}

export interface MediaResponse {
  type: 'video' | 'photo';
  media_items: MediaItem[];
  tweet: TweetInfo;
}

export type MediaType = 'video' | 'photo';