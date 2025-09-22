import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { withRole } from '@/lib/middleware';
import { z } from 'zod';

const adminCreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  role: z.enum(['citizen', 'field_worker', 'department_admin', 'regional_admin', 'city_admin']),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  ward: z.string().optional(),
});

async function createUser(req: NextRequest & { user?: any }) {
  try {
    await connectDB();

    const body = await req.json();
    const validatedData = adminCreateUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate role-specific requirements
    if ((validatedData.role === 'field_worker' || validatedData.role === 'department_admin') && !validatedData.department) {
      return NextResponse.json(
        { error: 'Department is required for field workers and department admins' },
        { status: 400 }
      );
    }

    if (validatedData.role === 'regional_admin' && !validatedData.ward) {
      return NextResponse.json(
        { error: 'Ward is required for regional admins' },
        { status: 400 }
      );
    }

    // Only city_admin can create other admins
    if (validatedData.role !== 'citizen' && req.user.role !== 'city_admin') {
      return NextResponse.json(
        { error: 'Only city administrators can create admin users' },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = new User({
      ...validatedData,
      password: hashedPassword,
    });

    await user.save();

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      department: user.department,
      ward: user.ward,
      profileImage: user.profileImage,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: userData,
    }, { status: 201 });

  } catch (error) {
    console.error('Admin create user error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only city_admin can access this endpoint
export const POST = withRole(['city_admin'])(createUser);
