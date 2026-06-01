/**
 * Publishes a photo to a Facebook Page feed via Meta Graph API
 * @param {object} params
 * @param {string} params.imageUrl - Hosted image URL (e.g., from Cloudinary)
 * @param {string} params.caption - Accompanying status message text
 * @returns {Promise<object>} Facebook Graph API response
 */
export async function postFacebook({ imageUrl, caption }) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.FACEBOOK_PAGE_TOKEN;

  if (!pageId || !pageToken) {
    throw new Error('Facebook: Missing required environment credentials (FACEBOOK_PAGE_ID or FACEBOOK_PAGE_TOKEN)');
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
        message: caption || '',
        access_token: pageToken,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: { message: `HTTP status ${response.status}` } };
    }

    if (!response.ok || data.error) {
      const errMsg = data.error?.message || 'Page photo post rejected';
      throw new Error(`Facebook: ${errMsg}`);
    }

    return data;
  } catch (err) {
    if (err.message.startsWith('Facebook:')) {
      throw err;
    }
    throw new Error(`Facebook: ${err.message || err}`);
  }
}
