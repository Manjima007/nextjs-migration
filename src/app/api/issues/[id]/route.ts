import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue, { IIssue } from '@/models/Issue';
import User from '@/models/User';
import Analytics from '@/models/Analytics';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

const updateIssueSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']).optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  estimatedResolutionTime: z.string().datetime().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000, 'Feedback comment must be less than 1000 characters'),
});

// GET /api/issues/[id] - Get specific issue
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withAuth(async (authReq: NextRequest & { user?: any }) => {
    try {
      await connectDB();
      
      const { id } = await context.params;

      const issue = await Issue.findById(id)
        .populate('reportedBy', 'name email phone')
        .populate('assignedTo', 'name email phone')
        .populate('history.changedBy', 'name email')
        .lean() as any;

      if (!issue) {
        return NextResponse.json(
          { error: 'Issue not found' },
          { status: 404 }
        );
      }

      // Check if user has permission to view this issue
      const canView = (
        authReq.user.role === 'city_admin' ||
        (authReq.user.role === 'regional_admin' && issue.ward === authReq.user.ward) ||
        (authReq.user.role === 'department_admin' && issue.department === authReq.user.department) ||
        (authReq.user.role === 'field_worker' && (issue.assignedTo?.toString() === authReq.user.userId || issue.department === authReq.user.department)) ||
        (authReq.user.role === 'citizen' && issue.reportedBy.toString() === authReq.user.userId)
      );

      if (!canView) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({ issue });

    } catch (error) {
      console.error('Get issue error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(req);
}

// PATCH /api/issues/[id] - Update issue
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withAuth(async (authReq: NextRequest & { user?: any }) => {
    try {
      await connectDB();
      
      const { id } = await context.params;

      const issue = await Issue.findById(id);
      if (!issue) {
        return NextResponse.json(
          { error: 'Issue not found' },
          { status: 404 }
        );
      }

      const body = await authReq.json();
      const validatedData = updateIssueSchema.parse(body);

      // Check permissions based on role
      const canUpdate = (
        authReq.user.role === 'city_admin' ||
        (authReq.user.role === 'regional_admin' && issue.ward === authReq.user.ward) ||
        (authReq.user.role === 'department_admin' && issue.department === authReq.user.department) ||
        (authReq.user.role === 'field_worker' && issue.assignedTo?.toString() === authReq.user.userId)
      );

      if (!canUpdate) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Update fields
      const updates: any = {};
      if (validatedData.status) updates.status = validatedData.status;
      if (validatedData.priority) updates.priority = validatedData.priority;
      if (validatedData.estimatedResolutionTime) updates.estimatedResolutionTime = new Date(validatedData.estimatedResolutionTime);

      // Handle assignment
      if (validatedData.assignedTo) {
        // Verify the assigned user exists and is a field worker in the same department
        const assignee = await User.findById(validatedData.assignedTo);
        if (!assignee || assignee.role !== 'field_worker' || assignee.department !== issue.department) {
          return NextResponse.json(
            { error: 'Invalid assignee' },
            { status: 400 }
          );
        }
        updates.assignedTo = validatedData.assignedTo;
        if (!validatedData.status) {
          updates.status = 'assigned';
        }
      }

      // Record resolution time if status is resolved
      if (validatedData.status === 'resolved' && issue.status !== 'resolved') {
        updates.actualResolutionTime = new Date();
      }

      // Add to history
      const historyEntry = {
        status: updates.status || issue.status,
        changedBy: authReq.user.userId,
        changedAt: new Date(),
        comment: validatedData.comment,
      };

      const updatedIssue = await Issue.findByIdAndUpdate(
        id,
        {
          ...updates,
          $push: { history: historyEntry },
        },
        { new: true, runValidators: true }
      )
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone');

      // Record analytics for resolution
      if (validatedData.status === 'resolved' && issue.status !== 'resolved') {
        const resolutionTime = (new Date().getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60); // hours
        
        const analytics = new Analytics({
          type: 'issue_resolved',
          entityId: issue._id,
          entityType: 'Issue',
          metadata: {
            category: issue.category,
            department: issue.department,
            ward: issue.ward,
            priority: issue.priority,
            resolutionTime,
          },
        });

        await analytics.save();
      }

      return NextResponse.json({
        message: 'Issue updated successfully',
        issue: updatedIssue,
      });

    } catch (error) {
      console.error('Update issue error:', error);
      
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
  })(req);
}