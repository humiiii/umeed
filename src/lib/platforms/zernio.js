/**
 * Publishes a post across multiple platforms using Zernio's unified social media API.
 * @param {object} params
 * @param {string} [params.imageUrl] - Hosted image URL (e.g., from Cloudinary)
 * @param {string} [params.caption] - The text content of the post
 * @param {Array<string>} params.platforms - Array of platform names (e.g., ['facebook', 'linkedin'])
 * @returns {Promise<object>} Zernio API response JSON
 */
export async function postToZernio({ imageUrl, caption, platforms }) {
  const apiKey = process.env.ZERNIO_API_KEY;
  if (!apiKey) {
    throw new Error('Zernio: Missing ZERNIO_API_KEY environment variable. Please configure it in your .env.local file.');
  }

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    throw new Error('Zernio: No platforms selected for publishing.');
  }

  const zernioPlatforms = [];

  if (platforms.includes('facebook')) {
    const facebookAccountId = process.env.ZERNIO_FACEBOOK_ACCOUNT_ID;
    if (!facebookAccountId) {
      throw new Error('Zernio: Missing ZERNIO_FACEBOOK_ACCOUNT_ID environment variable.');
    }
    zernioPlatforms.push({ platform: 'facebook', accountId: facebookAccountId });
  }

  if (platforms.includes('linkedin')) {
    const linkedinAccountId = process.env.ZERNIO_LINKEDIN_ACCOUNT_ID;
    if (!linkedinAccountId) {
      throw new Error('Zernio: Missing ZERNIO_LINKEDIN_ACCOUNT_ID environment variable.');
    }
    zernioPlatforms.push({ platform: 'linkedin', accountId: linkedinAccountId });
  }



  if (zernioPlatforms.length === 0) {
    throw new Error(`Zernio: None of the selected platforms (${platforms.join(', ')}) are supported or configured in .env.local.`);
  }

  // Construct Zernio API request payload
  const payload = {
    content: caption || '',
    platforms: zernioPlatforms,
    publishNow: true // The application handles scheduling locally via DB and cron
  };

  // Add media if provided
  if (imageUrl) {
    payload.mediaItems = [
      {
        type: 'image',
        url: imageUrl
      }
    ];
  }

  try {
    const response = await fetch('https://zernio.com/api/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: { message: `HTTP status ${response.status}` } };
    }

    if (!response.ok || data.error) {
      const errMsg = data.error?.message || data.error || 'Request rejected by Zernio';
      throw new Error(`Zernio Error: ${errMsg}`);
    }

    return data;
  } catch (err) {
    if (err.message.startsWith('Zernio:')) {
      throw err;
    }
    throw new Error(`Zernio: ${err.message || err}`);
  }
}
