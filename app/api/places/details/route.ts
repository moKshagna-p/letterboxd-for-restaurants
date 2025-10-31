import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get('place_id');

  if (!placeId) {
    return NextResponse.json(
      { error: 'Place ID is required' },
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

  console.log('Fetching place details for:', placeId);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,photos,opening_hours,price_level,types,geometry,website,formatted_phone_number,reviews&key=${apiKey}`
    );

    const data = await response.json();
    console.log('Place details API response status:', data.status);

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: `Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Get photo URLs
    const photos = (data.result.photos || []).map((photo: any) => ({
      url: `/api/places/photo?photo_reference=${photo.photo_reference}&maxwidth=800`,
      reference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
    }));

    // Format reviews
    const reviews = (data.result.reviews || []).map((review: any) => ({
      id: review.time.toString(),
      userName: review.author_name,
      rating: review.rating,
      comment: review.text,
      date: new Date(review.time * 1000).toISOString().split('T')[0],
    }));

    return NextResponse.json({
      ...data.result,
      photos,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}

