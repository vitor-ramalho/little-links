import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_token');
    const token = authCookie ? authCookie.value : undefined;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get period from query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    
    // Forward the request to the API
    const response = await fetch(`${apiUrl}/analytics/dashboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch dashboard analytics data' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
