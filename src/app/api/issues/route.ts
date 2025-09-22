import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';
import Analytics from '@/models/Analytics';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum([
    'water_supply',
    'sanitation', 
    'road_maintenance',
    'street_lighting',
    'drainage',
    'traffic',
    'public_safety',
    'parks_recreation',
    'noise_pollution',
    'air_quality',
    'electricity',
    'other',
    // Legacy categories for backwards compatibility
    'infrastructure', 
    'utilities', 
    'environment', 
    'safety'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  department: z.string().min(1, 'Department is required'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
  images: z.array(z.string()).default([]),
  ward: z.string().min(1, 'Ward is required'),
  contactInfo: z.object({
    phone: z.string().optional(),
    preferredContact: z.string().optional(),
  }).nullable().optional(),
  isAnonymous: z.boolean().optional(),
});

// GET /api/issues - Get issues with filters
async function getIssues(req: NextRequest & { user?: any }) {
  try {
    await connectDB();
    
    // Ensure User model is registered for population
    const UserModel = User;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const department = searchParams.get('department');
    const ward = searchParams.get('ward');
    const assignedTo = searchParams.get('assignedTo');

    // Build query based on user role
    let query: any = {};

    // Role-based filtering
    switch (req.user.role) {
      case 'citizen':
        query.reportedBy = req.user.userId;
        break;
      case 'field_worker':
        query.$or = [
          { assignedTo: req.user.userId },
          { department: req.user.department, status: 'pending' }
        ];
        break;
      case 'department_admin':
        query.department = req.user.department;
        break;
      case 'regional_admin':
        query.ward = req.user.ward;
        break;
      case 'city_admin':
        // Can see all issues
        break;
    }

    // Apply additional filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department && req.user.role === 'city_admin') query.department = department;
    if (ward && (req.user.role === 'city_admin' || req.user.role === 'regional_admin')) query.ward = ward;
    
    // Handle assignedTo filter
    if (assignedTo) {
      if (assignedTo === 'me') {
        // Special case: user wants to see issues assigned to them
        query.assignedTo = req.user.userId;
      } else if (['department_admin', 'city_admin'].includes(req.user.role)) {
        query.assignedTo = assignedTo;
      }
    }

    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reportedBy', 'name email phone')
        .populate('assignedTo', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query)
    ]);

    return NextResponse.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get issues error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/issues - Create new issue
async function createIssue(req: NextRequest & { user?: any }) {
  try {
    await connectDB();

    let body: any;
    let images: File[] = [];

    // Check if the request contains FormData (with files)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await req.formData();
      
      body = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        priority: formData.get('priority') as string,
        location: JSON.parse(formData.get('location') as string),
        contactNumber: formData.get('contactNumber') as string,
        isAnonymous: formData.get('isAnonymous') === 'true',
      };

      // Extract uploaded images
      const imageFiles = formData.getAll('images') as File[];
      images = imageFiles.filter(file => file.size > 0);
      
    } else {
      // Handle regular JSON request
      body = await req.json();
    }

    // Convert location format if needed
    if (body.location && !body.location.address) {
      return NextResponse.json(
        { error: 'Location address is required' },
        { status: 400 }
      );
    }

    // Prepare issue data with proper location format
    const issueData = {
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority || 'medium',
      department: getDepartmentFromCategory(body.category),
      location: {
        address: body.location.address,
        coordinates: {
          latitude: body.location.lat || 0,
          longitude: body.location.lng || 0,
        },
      },
      images: [], // We'll process images separately for now
      ward: req.user.ward || 'Ward-1', // Default ward if not specified
      contactInfo: body.isAnonymous ? null : {
        phone: body.contactNumber,
        preferredContact: 'phone'
      },
      isAnonymous: body.isAnonymous || false,
    };

    // Validate the data
    const validatedData = createIssueSchema.parse(issueData);

    // Only citizens can create issues directly
    if (req.user.role !== 'citizen') {
      return NextResponse.json(
        { error: 'Only citizens can create issues' },
        { status: 403 }
      );
    }

    const issue = new Issue({
      ...validatedData,
      reportedBy: req.user.userId,
      history: [{
        status: 'pending',
        changedBy: req.user.userId,
        changedAt: new Date(),
        comment: 'Issue created',
      }],
    });

    await issue.save();

    // Record analytics
    const analytics = new Analytics({
      type: 'issue_created',
      entityId: issue._id,
      entityType: 'Issue',
      metadata: {
        category: issue.category,
        department: issue.department,
        ward: issue.ward,
        priority: issue.priority,
      },
    });

    await analytics.save();

    // Populate the created issue
    await issue.populate('reportedBy', 'name email phone');

    return NextResponse.json({
      message: 'Issue created successfully',
      issue,
    }, { status: 201 });

  } catch (error) {
    console.error('Create issue error:', error);
    
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

// Helper function to map categories to departments
function getDepartmentFromCategory(category: string): string {
  const categoryToDepartment: Record<string, string> = {
    'water_supply': 'Water Department',
    'sanitation': 'Sanitation Department',
    'road_maintenance': 'Public Works Department',
    'street_lighting': 'Electrical Department',
    'drainage': 'Water Department',
    'traffic': 'Traffic Police',
    'public_safety': 'Security Department',
    'parks_recreation': 'Parks Department',
    'noise_pollution': 'Environmental Department',
    'air_quality': 'Environmental Department',
    'electricity': 'Electrical Department',
    'other': 'General Administration'
  };
  
  return categoryToDepartment[category] || 'General Administration';
}

export const GET = withAuth(getIssues);
export const POST = withAuth(createIssue);