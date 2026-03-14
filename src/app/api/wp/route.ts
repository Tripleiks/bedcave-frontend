import { NextRequest, NextResponse } from 'next/server';

const WP_API_BASE = 'http://blog.bedcave.com/wp-json/wp/v2';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'posts';
  
  // Build query string
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      queryParams.append(key, value);
    }
  });
  
  const url = `${WP_API_BASE}/${endpoint}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'WordPress API error' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from WordPress' },
      { status: 500 }
    );
  }
}
