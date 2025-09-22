import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Check if field worker exists
    const fieldWorker = await User.findOne({ email: 'worker1@contractor.com' });
    
    if (fieldWorker) {
      return NextResponse.json({
        message: 'Field worker found',
        user: {
          id: fieldWorker._id,
          name: fieldWorker.name,
          email: fieldWorker.email,
          role: fieldWorker.role,
          isActive: fieldWorker.isActive,
          department: fieldWorker.department
        }
      });
    } else {
      return NextResponse.json({
        message: 'Field worker not found',
        suggestion: 'Database might need to be seeded'
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}