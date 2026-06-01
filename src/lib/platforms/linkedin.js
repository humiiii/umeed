/**
 * Shares an image post to LinkedIn via UGC Posts API
 * @param {object} params
 * @param {string} params.imageUrl - Hosted image URL (e.g., from Cloudinary)
 * @param {string} params.caption - Description/commentary text
 * @returns {Promise<object>} LinkedIn API response JSON
 */
export async function postLinkedIn({ imageUrl, caption }) {
  const userId = process.env.LINKEDIN_USER_ID;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!userId || !accessToken) {
    throw new Error('LinkedIn: Missing required environment credentials (LINKEDIN_USER_ID or LINKEDIN_ACCESS_TOKEN)');
  }

  // Ensure author urn formatting is correct
  if (!userId.startsWith('urn:li:')) {
    throw new Error('LinkedIn: USER_ID must be a fully qualified URN (e.g., urn:li:person:XXXXX or urn:li:organization:XXXXX)');
  }

  try {
    const payload = {
      author: userId,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: caption || '',
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              originalUrl: imageUrl,
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: `HTTP status ${response.status}` };
    }

    if (!response.ok) {
      const errMsg = data.message || 'UGC Post request rejected';
      throw new Error(`LinkedIn: ${errMsg}`);
    }

    return data;
  } catch (err) {
    if (err.message.startsWith('LinkedIn:')) {
      throw err;
    }
    throw new Error(`LinkedIn: ${err.message || err}`);
  }
}
