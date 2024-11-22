import { MediaResponse } from './types';

export async function getMediaInfo(tweetUrl: string): Promise<MediaResponse> {
  try {
    const response = await fetch('/api/twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweetUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get media information');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to get media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}