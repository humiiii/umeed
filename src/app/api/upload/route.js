import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/png';
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await uploadToCloudinary(dataUri, {
      folder: 'umeed_uploads',
    });

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return Response.json({
      url: result.data.secure_url,
      publicId: result.data.public_id,
      width: result.data.width,
      height: result.data.height,
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
