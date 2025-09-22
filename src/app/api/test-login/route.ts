import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test field worker login
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'worker1@contractor.com',
        password: 'demo123'
      }),
    });

    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data: data
    });
    
  } catch (error) {
    console.error('Login test error:', error);
    return NextResponse.json({
      error: 'Login test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}