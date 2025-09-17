import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import Analytics from '@/models/Analytics';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(['sanitation', 'infrastructure', 'utilities', 'traffic', 'environment', 'safety', 'other']),
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
});

// GET /api/issues - Get issues with filters
async function getIssues(req: NextRequest & { user?: any }) {
  try {
    await connectDB();

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
    if (assignedTo && ['department_admin', 'city_admin'].includes(req.user.role)) query.assignedTo = assignedTo;

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

    const body = await req.json();
    const validatedData = createIssueSchema.parse(body);

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

export const GET = withAuth(getIssues);
export const POST = withAuth(createIssue);