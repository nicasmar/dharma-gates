import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('URL upload API called');


    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    console.log('Fetching image from URL:', imageUrl);

    // Validate URL
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'DharmaGates-PhotoUploader/1.0'
      }
    });

    if (!imageResponse.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` 
      }, { status: 400 });
    }

    // Check content type
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 });
    }

    // Check file size (limit to 10MB for URLs to be more flexible)
    const contentLength = imageResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 });
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Check actual size after download
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 });
    }

    // Generate filename based on URL
    const urlPath = url.pathname;
    const fileExt = urlPath.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `monastery-photos/${fileName}`;

    console.log('Uploading to Supabase Storage:', filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images-of-dharma-centers')
      .upload(filePath, buffer, {
        contentType: contentType,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: `Failed to upload image: ${error.message}` }, { status: 500 });
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images-of-dharma-centers')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      originalUrl: imageUrl
    });

  } catch (error) {
    console.error('Error uploading photo from URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 