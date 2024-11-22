import { NextRequest, NextResponse } from 'next/server';

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
  const response = await fetch(MAINJS_URL);
  const text = await response.text();
  const match = text.match(/"Bearer ([^"]+)"/);
  return match ? match[1] : null;
}

async function getGuestToken(bearerToken: string) {
  const response = await fetch(ACTIVATE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
    },
  });
  const data = await response.json();
  return data.guest_token;
}

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
    console.log('Fetching tweet details from URL:', url);
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

    const text = await response.text();
    console.log('Raw response:', text);
    
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON parse error:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Response text:', text);
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get tweet details: ${error.message}`);
    }
    throw new Error('Failed to get tweet details: Unknown error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error('Request JSON parse error:', error instanceof Error ? error.message : 'Unknown error');
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        rawBody,
        parseError: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }
    
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid Twitter URL' }, { status: 400 });
    }

    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return NextResponse.json({ error: 'Failed to get bearer token' }, { status: 500 });
    }

    const guestToken = await getGuestToken(bearerToken);
    if (!guestToken) {
      return NextResponse.json({ error: 'Failed to get guest token' }, { status: 500 });
    }

    const tweetData = await getTweetDetails(tweetId, bearerToken, guestToken);
    return NextResponse.json(tweetData);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';
