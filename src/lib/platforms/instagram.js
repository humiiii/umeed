/**
 * Publishes an image post to Instagram Business Account via Meta Graph API v21.0
 * @param {object} params
 * @param {string} params.imageUrl - Hosted image URL (e.g., from Cloudinary)
 * @param {string} params.caption - Accompanying caption text
 * @returns {Promise<object>} Meta API publication response
 */
export async function postInstagram({ imageUrl, caption }) {
  const userId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!userId || !accessToken) {
    throw new Error('Instagram: Missing required environment credentials (INSTAGRAM_USER_ID or INSTAGRAM_ACCESS_TOKEN)');
  }

  try {
    // Step 1: Create an item container
    const containerRes = await fetch(`https://graph.facebook.com/v21.0/${userId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption || '',
        access_token: accessToken,
      }),
    });

    let containerData;
    try {
      containerData = await containerRes.json();
    } catch (e) {
      containerData = { error: { message: `HTTP status ${containerRes.status}` } };
    }

    if (!containerRes.ok || containerData.error) {
      const errMsg = containerData.error?.message || 'Failed to create container';
      throw new Error(`Instagram: Container Creation: ${errMsg}`);
    }

    const creationId = containerData.id;
    if (!creationId) {
      throw new Error('Instagram: Container Creation: Response did not return a valid container ID');
    }

    // Step 2: Publish the item container
    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${userId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    let publishData;
    try {
      publishData = await publishRes.json();
    } catch (e) {
      publishData = { error: { message: `HTTP status ${publishRes.status}` } };
    }

    if (!publishRes.ok || publishData.error) {
      const errMsg = publishData.error?.message || 'Failed to publish media';
      throw new Error(`Instagram: Publish: ${errMsg}`);
    }

    return publishData;
  } catch (err) {
    // Standardize all network and operational issues
    if (err.message.startsWith('Instagram:')) {
      throw err;
    }
    throw new Error(`Instagram: ${err.message || err}`);
  }
}
