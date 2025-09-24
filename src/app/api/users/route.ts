import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/middleware';

// GET /api/users - Get users with filters
async function getUsers(req: NextRequest & { user?: any }) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    
    // Build query based on filters and user role
    let query: any = {};
    
    // Only allow department admins to fetch their department's users
    if (req.user.role === 'department_admin') {
      query.department = req.user.department;
    } else if (!['super_admin', 'city_admin'].includes(req.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Apply filters
    if (role) query.role = role;
    if (department && ['super_admin', 'city_admin'].includes(req.user.role)) {
      query.department = department;
    }

    const users = await User.find(query).select('-password').lean();

    return NextResponse.json({ 
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Error in getUsers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
async function createUser(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();

    const newUser = new User(body);
    await newUser.save();

    const userWithoutPassword = { ...newUser.toObject() };
    delete userWithoutPassword.password;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Export the handler
export const GET = withAuth(getUsers);
export const POST = withAuth(createUser);