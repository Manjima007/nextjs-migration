import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'field_worker', 'department_admin', 'regional_admin', 'city_admin']),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  ward: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validatedData = registerSchema.parse(body);

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

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = new User({
      ...validatedData,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      department: user.department,
      ward: user.ward,
    });

    // Return user data (without password) and token
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
      message: 'User registered successfully',
      user: userData,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
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