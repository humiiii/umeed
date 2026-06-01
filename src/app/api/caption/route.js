import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageUrl, context } = body;

    if (!imageUrl) {
      return Response.json(
        { error: 'An image URL is required to generate a caption' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Gemini API is not configured on the server. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // 1. Fetch the image from the provided URL
    let base64Data;
    let mimeType;
    try {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        throw new Error(`Failed to fetch image: HTTP status ${imgRes.status}`);
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } catch (fetchErr) {
      console.error('Gemini image fetch error:', fetchErr);
      return Response.json(
        { error: 'Failed to retrieve selected image from hosted server' },
        { status: 500 }
      );
    }

    // 2. Initialize Gemini API Client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // As explicitly requested, we are utilizing the 'gemini-2.5-flash-lite' model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const prompt = `You are a creative director and cultural storyteller who writes 
for top lifestyle, tech, and creator brands. Your captions feel written by a 
real person — never robotic, never buzzword-heavy, never obviously AI.

IMAGE CONTEXT: ${context ? `"${context}"` : 'Analyze the image mood, subject, colors, and energy to craft the caption.'}

CAPTION RULES:
1. VOICE: Conversational, confident, and real. Write like a knowledgeable 
   friend, not a marketer. Avoid words like: "elevate", "unlock", "empower", 
   "game-changer", "leverage", "dive in", "journey", "seamless", "innovative", 
   "revolutionize", "supercharge", or any corporate buzzwords.

2. STRUCTURE:
   - Line 1: A sharp, curiosity-triggering opener. Could be a punchy 
     observation, a short bold statement, or an unexpected take. 
     NOT a question starting with "Ever wonder..." or "Did you know...".
   - Line 2-3: 1-2 lines of natural copy that adds context, mood, 
     or a relatable human moment.
   - Final line: A light, organic CTA — feels like a suggestion, 
     not a command. (e.g. "drop your thoughts below 👇" or "save this one.")

3. EMOJIS: Use 2-3 emojis maximum. Place them naturally mid-sentence 
   or at line ends — never as bullet points or sentence starters.
   Pick emojis that feel current and match the image mood.

4. HASHTAGS: End with exactly 4-5 hashtags on a new line.
   Mix strategy: 1 broad trending tag + 2 niche relevant tags + 
   1 community tag. Examples of good niche tags: #buildinpublic, 
   #designmatters, #creatoreconomy, #indiemaker, #slowliving — 
   pick what genuinely fits the image, not generic ones like 
   #instagood or #photooftheday.

5. LENGTH: Entire output under 240 characters (excluding hashtags).
   Tight and punchy beats long and padded every time.

6. OUTPUT FORMAT: Return ONLY the caption + hashtags. 
   No quotes. No explanation. No intro. No label. Just the text.
   
WHAT TO AVOID:
- Starting with "In a world where..."
- Em dashes used dramatically — like this — for emphasis
- Phrases: "It's giving", "no cap", "slay", "hits different" 
  (overdone, feel forced)
- Listing features like a product spec sheet
- Ending with "What do you think? Let me know in the comments!"
- Any sentence that sounds like it came from a LinkedIn thought leader`;
    // 4. Generate content with text prompt + base64 image data
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const captionText = result.response.text();
    if (!captionText) {
      throw new Error('No content returned from the generative model');
    }

    return Response.json({ caption: captionText.trim() });
  } catch (error) {
    console.error('Caption generator API error:', error);
    return Response.json(
      { error: error.message || 'Internal server error during caption generation' },
      { status: 500 }
    );
  }
}
