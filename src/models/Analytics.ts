import mongoose from 'mongoose';

export interface IAnalytics extends mongoose.Document {
  _id: string;
  type: 'issue_created' | 'issue_resolved' | 'user_registered' | 'department_activity';
  entityId: mongoose.Schema.Types.ObjectId; // Reference to the related entity
  entityType: 'Issue' | 'User' | 'Department';
  metadata: {
    category?: string;
    department?: string;
    ward?: string;
    priority?: string;
    resolutionTime?: number; // in hours
    rating?: number;
    userRole?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

const analyticsSchema = new mongoose.Schema<IAnalytics>({
  type: {
    type: String,
    enum: ['issue_created', 'issue_resolved', 'user_registered', 'department_activity'],
    required: [true, 'Analytics type is required'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required'],
  },
  entityType: {
    type: String,
    enum: ['Issue', 'User', 'Department'],
    required: [true, 'Entity type is required'],
  },
  metadata: {
    category: String,
    department: String,
    ward: String,
    priority: String,
    resolutionTime: Number,
    rating: Number,
    userRole: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient analytics queries
analyticsSchema.index({ type: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ 'metadata.department': 1 });
analyticsSchema.index({ 'metadata.ward': 1 });
analyticsSchema.index({ 'metadata.category': 1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', analyticsSchema);