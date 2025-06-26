import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!address && (!lat || !lon)) {
    return NextResponse.json(
      { error: 'Either address or lat/lon coordinates are required' },
      { status: 400 }
    );
  }

  try {
    let url: string;
    
    if (address) {
      // Forward geocoding (address to coordinates)
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
    } else {
      // Reverse geocoding (coordinates to address)
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'DharmaGates/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    if (address) {
      // Forward geocoding response
      if (data && data.length > 0) {
        const result = data[0];
        const addressDetails = result.address || {};
        
        const country = addressDetails.country || '';
        const state = addressDetails.state || 
                     addressDetails.province || 
                     addressDetails.region || 
                     addressDetails['ISO3166-2-lvl4'] || '';
        
        return NextResponse.json({
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          display_name: result.display_name,
          country,
          state
        });
      }
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    } else {
      // Reverse geocoding response
      if (data && data.display_name) {
        const addressDetails = data.address || {};
        
        const country = addressDetails.country || '';
        const state = addressDetails.state || 
                     addressDetails.province || 
                     addressDetails.region || 
                     addressDetails['ISO3166-2-lvl4'] || '';
        
        return NextResponse.json({
          display_name: data.display_name,
          country,
          state
        });
      }
      return NextResponse.json({ error: 'Coordinates not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Geocoding service temporarily unavailable' },
      { status: 503 }
    );
  }
} 