import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const latitude = searchParams.get('lat');
  const longitude = searchParams.get('lng');
  const radius = searchParams.get('radius') || '50000';

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
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

  console.log('Searching for:', query, 'near location:', latitude, longitude);

  try {
    // Use Text Search API for better results with location context
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurant')}&location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    console.log('Text Search API Response status:', data.status, 'Results:', data.results?.length || 0);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: `Google Places API error: ${data.status}` },
        { status: 500 }
      );
    }

    // Filter out resorts and non-food establishments
    const filteredResults = (data.results || []).filter((place: any) => {
      // Exclude resorts, hotels, and non-food establishments
      const excludeTypes = ['lodging', 'resort', 'hotel', 'motel', 'hostel', 'campground', 'spa', 'beauty_salon'];
      const excludeKeywords = ['resort', 'hotel', 'spa', 'wellness', 'accommodation', 'beauty', 'salon'];
      
      // Check if place has any excluded types
      const hasExcludedType = place.types?.some((type: string) => 
        excludeTypes.includes(type)
      );
      
      // Check if place name contains excluded keywords
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        place.name?.toLowerCase().includes(keyword)
      );
      
      // Must be a food establishment
      const isFoodEstablishment = place.types?.some((type: string) => 
        ['restaurant', 'food', 'meal_takeaway', 'meal_delivery', 'cafe', 'bakery', 'bar'].includes(type)
      );
      
      return !hasExcludedType && !hasExcludedKeyword && isFoodEstablishment;
    });

    // Get detailed information for each filtered place
    const restaurantsWithDetails = await Promise.all(
      filteredResults.slice(0, 50).map(async (place: any) => {
        // Get place details for additional information
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,photos,opening_hours,price_level,types,geometry,website,formatted_phone_number&key=${apiKey}`
        );

        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK' && detailsData.result) {
          const details = detailsData.result;

          // Get photo URL
          let photoUrl = null;
          if (details.photos && details.photos.length > 0) {
            const photoReference = details.photos[0].photo_reference;
            photoUrl = `/api/places/photo?photo_reference=${photoReference}&maxwidth=800`;
          }

          return {
            id: place.place_id,
            name: details.name,
            address: details.formatted_address,
            rating: details.rating || 0,
            reviewCount: details.user_ratings_total || 0,
            photoUrl: photoUrl,
            openNow: details.opening_hours?.open_now,
            priceLevel: details.price_level,
            types: details.types,
            website: details.website,
            phone: details.formatted_phone_number,
            location: {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            },
            placeId: place.place_id,
          };
        }

        return null;
      })
    );

    const validRestaurants = restaurantsWithDetails.filter((r) => r !== null);

    return NextResponse.json({
      restaurants: validRestaurants,
      total: validRestaurants.length,
      query: query,
    });
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}
