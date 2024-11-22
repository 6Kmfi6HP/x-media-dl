import { NextRequest, NextResponse } from 'next/server';

interface VideoVariant {
  content_type: string;
  bitrate?: number;
  url: string;
}

interface MediaSize {
  w: number;
  h: number;
  resize: 'fit' | 'crop';
}

interface MediaSizes {
  large: MediaSize;
  medium: MediaSize;
  small: MediaSize;
  thumb: MediaSize;
}

interface MediaItem {
  type: 'video' | 'photo';
  url: string;
  media_url_https: string;
  sizes: MediaSizes;
  variants?: VideoVariant[];
  duration_millis?: number;
  aspect_ratio?: number[];
}

interface MediaEntity {
  type: string;
  url: string;
  media_url_https: string;
  sizes: MediaSizes;
  video_info?: {
    variants: {
      content_type: string;
      bitrate?: number;
      url: string;
    }[];
    duration_millis?: number;
    aspect_ratio?: number[];
  };
  variants?: {
    content_type: string;
    bitrate?: number;
    url: string;
  }[];
  duration_millis?: number;
  aspect_ratio?: number[];
}

interface TweetInfo {
  id: string;
  text: string;
  created_at: string;
  user: {
    name: string;
    screen_name: string;
    profile_image_url: string;
    is_blue_verified: boolean;
    description: string;
    followers_count: number;
    following_count: number;
  };
  reply_count: number;
  retweet_count: number;
  quote_count: number;
  favorite_count: number;
  view_count?: number;
}

interface MediaResponse {
  type: 'video' | 'photo' | 'mixed';
  media_items: MediaItem[];
  tweet: TweetInfo;
}

/**
 * Extract tweet ID from various Twitter URL formats
 */
function extractTweetId(url: string): string | null {
  const patterns = [
    /twitter\.com\/\w+\/status\/(\d+)/,
    /x\.com\/\w+\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}
/**
 * Clean tweet text by removing t.co URLs at the end
 */
function cleanTweetText(text: string): string {
  // Remove t.co URLs at the end of the text
  return text.replace(/\s+https:\/\/t\.co\/\w+$/g, '');
}

/**
 * Process a media entity into a MediaItem
 */
function processMediaEntity(media: MediaEntity): MediaItem | null {
  // Handle both regular videos and animated GIFs
  if (media.type === 'video' || media.type === 'animated_gif') {
    // Extract video variants from either video_info or direct variants
    const videoVariants = (media.video_info?.variants || media.variants || [])
      .filter((v: { content_type: string }) => v.content_type === 'video/mp4')
      .sort((a: { bitrate?: number }, b: { bitrate?: number }) => (b.bitrate || 0) - (a.bitrate || 0));

    if (!videoVariants.length) {
      return null;
    }

    return {
      type: 'video',
      url: media.url,
      variants: videoVariants,
      duration_millis: media.video_info?.duration_millis || media.duration_millis,
      aspect_ratio: media.video_info?.aspect_ratio || media.aspect_ratio,
      media_url_https: media.media_url_https,
      sizes: media.sizes
    };
  } else if (media.type === 'photo') {
    return {
      type: 'photo',
      url: media.url,
      media_url_https: media.media_url_https,
      sizes: media.sizes
    };
  }
  return null;
}

/**
 * Determine the overall media type of the tweet
 */
function determineMediaType(mediaItems: MediaItem[]): 'video' | 'photo' | 'mixed' {
  const hasVideo = mediaItems.some(item => item.type === 'video');
  const hasPhoto = mediaItems.some(item => item.type === 'photo');

  if (hasVideo && hasPhoto) {
    return 'mixed';
  }
  return hasVideo ? 'video' : 'photo';
}

const BASE_URL = "https://api.x.com/graphql/OoJd6A50cv8GsifjoOHGfg";
const ACTIVATE_URL = "https://api.twitter.com/1.1/guest/activate.json";
const MAINJS_URL = "https://abs.twimg.com/responsive-web/client-web/main.165ee22a.js";

const DEFAULT_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0",
  "accept": "*/*",
  "accept-language": "de,en-US;q=0.7,en;q=0.3",
  "accept-encoding": "gzip, deflate, br",
  "te": "trailers",
};

async function getBearerToken() {
  try {
    const response = await fetch(MAINJS_URL, {
      headers: DEFAULT_HEADERS
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const bearerTokens = text.match(/AAAAAAAAA[^"]+/);

    if (!bearerTokens) {
      throw new Error("Could not find bearer token");
    }

    return bearerTokens[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get bearer token: ${error.message}`);
    }
    throw new Error('Failed to get bearer token: Unknown error');
  }
}

async function getGuestToken(bearerToken: string) {
  try {
    const response = await fetch(ACTIVATE_URL, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'authorization': `Bearer ${bearerToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.guest_token) {
      throw new Error('No guest token in response');
    }
    return data.guest_token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get guest token: ${error.message}`);
    }
    throw new Error('Failed to get guest token: Unknown error');
  }
}

function buildTweetDetailUrl(tweetId: string): string {
  const variables = {
    "tweetId": tweetId,
    "withCommunity": false,
    "includePromotedContent": false,
    "withVoice": false
  };

  const features = {
    "creator_subscriptions_tweet_preview_api_enabled": true,
    "communities_web_enable_tweet_community_results_fetch": true,
    "c9s_tweet_anatomy_moderator_badge_enabled": true,
    "articles_preview_enabled": true,
    "responsive_web_edit_tweet_api_enabled": true,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
    "view_counts_everywhere_api_enabled": true,
    "longform_notetweets_consumption_enabled": true,
    "responsive_web_twitter_article_tweet_consumption_enabled": true,
    "tweet_awards_web_tipping_enabled": false,
    "creator_subscriptions_quote_tweet_preview_enabled": false,
    "freedom_of_speech_not_reach_fetch_enabled": true,
    "standardized_nudges_misinfo": true,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
    "rweb_video_timestamps_enabled": true,
    "longform_notetweets_rich_text_read_enabled": true,
    "longform_notetweets_inline_media_enabled": true,
    "rweb_tipjar_consumption_enabled": true,
    "responsive_web_graphql_exclude_directive_enabled": true,
    "verified_phone_label_enabled": false,
    "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": true,
    "responsive_web_enhance_cards_enabled": false
  };

  const fieldToggles = {
    "withArticleRichContentState": true,
    "withArticlePlainText": false,
    "withGrokAnalyze": false,
    "withDisallowedReplyControls": false
  };

  const params = new URLSearchParams({
    variables: JSON.stringify(variables),
    features: JSON.stringify(features),
    fieldToggles: JSON.stringify(fieldToggles)
  });

  return `${BASE_URL}/TweetResultByRestId?${params.toString()}`;
}

async function getTweetDetails(tweetId: string, bearerToken: string, guestToken: string) {
  try {
    const url = buildTweetDetailUrl(tweetId);
    const response = await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        'authorization': `Bearer ${bearerToken}`,
        'x-guest-token': guestToken
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get tweet details: ${error.message}`);
    }
    throw new Error('Failed to get tweet details: Unknown error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Tweet URL is required' }, { status: 400 });
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid tweet URL' }, { status: 400 });
    }

    console.log('Getting bearer token...');
    const bearerToken = await getBearerToken();
    console.log('Bearer token obtained:', bearerToken.slice(0, 10) + '...');

    console.log('Getting guest token...');
    const guestToken = await getGuestToken(bearerToken);
    console.log('Guest token obtained:', guestToken);

    console.log('Getting tweet details...');
    const tweetData = await getTweetDetails(tweetId, bearerToken, guestToken);
    console.log('Tweet data structure:', JSON.stringify(tweetData, null, 2));

    try {
      // First try to get media from extended_entities, then fall back to entities
      const mediaEntities = 
        tweetData.data?.tweetResult?.result?.legacy?.extended_entities?.media ||
        tweetData.data?.tweetResult?.result?.extended_entities?.media ||
        tweetData.data?.tweetResult?.result?.legacy?.entities?.media || [];

      if (!mediaEntities || !mediaEntities.length) {
        console.error('No media entities found in tweet data');
        return NextResponse.json({ 
          error: 'No media found in tweet',
          debug: { mediaPath: 'No media entities in tweet data structure' } 
        }, { status: 404 });
      }

      // Process all media items
      const mediaItems: MediaItem[] = mediaEntities
        .map((media: MediaEntity) => {
          const processed = processMediaEntity(media);
          if (!processed) {
            console.log('Failed to process media entity:', media);
          }
          return processed;
        })
        .filter((item: MediaItem | null): item is MediaItem => item !== null);

      if (!mediaItems.length) {
        return NextResponse.json({ 
          error: 'No supported media found in tweet',
          debug: { 
            mediaEntities,
            processedCount: mediaItems.length 
          }
        }, { status: 404 });
      }

      const tweetResult = tweetData.data?.tweetResult?.result;
      const tweetLegacy = tweetResult?.legacy;
      const userResult = tweetResult?.core?.user_results?.result;
      const userLegacy = userResult?.legacy;

      if (!tweetLegacy) {
        return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
      }

      // Get tweet text from either note_tweet or legacy full_text
      const tweetText = tweetData.data?.tweetResult?.result?.note_tweet?.note_tweet_results?.result?.text || 
                       cleanTweetText(tweetLegacy.full_text);

      const tweetInfo: TweetInfo = {
        id: tweetLegacy.id_str,
        text: tweetText,
        created_at: tweetLegacy.created_at,
        user: {
          name: userLegacy?.name || '',
          screen_name: userLegacy?.screen_name || '',
          profile_image_url: userLegacy?.profile_image_url_https || '',
          is_blue_verified: userResult?.is_blue_verified || false,
          description: userLegacy?.description,
          followers_count: userLegacy?.followers_count,
          following_count: userLegacy?.friends_count
        },
        reply_count: tweetLegacy.reply_count,
        retweet_count: tweetLegacy.retweet_count,
        quote_count: tweetLegacy.quote_count,
        favorite_count: tweetLegacy.favorite_count,
        view_count: tweetResult.views?.count ? parseInt(tweetResult.views.count) : undefined
      };

      const response: MediaResponse = {
        type: determineMediaType(mediaItems),
        media_items: mediaItems,
        tweet: tweetInfo
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Failed to extract media:', error);
      return NextResponse.json({
        error: 'Could not find media information in tweet data',
        debug: { 
          tweetData,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const bearerToken = await getBearerToken();
    const guestToken = await getGuestToken(bearerToken);

    return NextResponse.json({ guestToken });
  } catch (error) {
    console.error('Guest token API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';