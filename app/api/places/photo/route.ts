import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const photoReference = searchParams.get('photo_reference');
  const maxWidth = searchParams.get('maxwidth') || '800';

  if (!photoReference) {
    return NextResponse.json(
      { error: 'Photo reference is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim();

  if (!apiKey) {
    console.error('Google Places API key is missing');
    return NextResponse.json(
      { error: 'Google Places API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const photoResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`
    );

    if (!photoResponse.ok) {
      console.error('Failed to fetch photo from Google Places API:', photoResponse.status, photoResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch photo' },
        { status: photoResponse.status }
      );
    }

    // Return the image directly
    return new NextResponse(photoResponse.body, {
      headers: {
        'Content-Type': photoResponse.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Error fetching place photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

