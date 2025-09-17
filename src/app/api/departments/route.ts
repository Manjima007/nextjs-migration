import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Department from '@/models/Department';
import { withRole } from '@/lib/middleware';

// GET /api/departments - Get all departments
async function getDepartments(req: NextRequest & { user?: any }) {
  try {
    await connectDB();

    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email')
      .populate('workers', 'name email')
      .lean();

    return NextResponse.json({ departments });

  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only city admins can access departments API
export const GET = withRole(['city_admin', 'regional_admin', 'department_admin'])(getDepartments);