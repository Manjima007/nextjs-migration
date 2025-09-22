import mongoose from 'mongoose';

export interface IIssue extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  category: 'water_supply' | 'sanitation' | 'road_maintenance' | 'street_lighting' | 'drainage' | 'traffic' | 'public_safety' | 'parks_recreation' | 'noise_pollution' | 'air_quality' | 'electricity' | 'other' | 'infrastructure' | 'utilities' | 'environment' | 'safety';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  reportedBy: mongoose.Schema.Types.ObjectId; // Reference to User
  assignedTo?: mongoose.Schema.Types.ObjectId; // Reference to field worker
  department: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[]; // Array of image URLs
  estimatedResolutionTime?: Date;
  actualResolutionTime?: Date;
  feedback?: {
    rating: number; // 1-5 stars
    comment: string;
    providedAt: Date;
  };
  history: Array<{
    status: string;
    changedBy: mongoose.Schema.Types.ObjectId;
    changedAt: Date;
    comment?: string;
  }>;
  upvotes: number;
  ward: string;
  contactInfo?: {
    phone?: string;
    preferredContact?: string;
  } | null;
  isAnonymous?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new mongoose.Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  category: {
    type: String,
    enum: ['water_supply', 'sanitation', 'road_maintenance', 'street_lighting', 'drainage', 'traffic', 'public_safety', 'parks_recreation', 'noise_pollution', 'air_quality', 'electricity', 'other', 'infrastructure', 'utilities', 'environment', 'safety'],
    required: [true, 'Category is required'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required'],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  images: [{
    type: String,
  }],
  estimatedResolutionTime: {
    type: Date,
  },
  actualResolutionTime: {
    type: Date,
  },
  feedback: {
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback comment cannot be more than 1000 characters'],
    },
    providedAt: {
      type: Date,
      default: Date.now,
    },
  },
  history: [{
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
    },
  }],
  upvotes: {
    type: Number,
    default: 0,
    min: [0, 'Upvotes cannot be negative'],
  },
  ward: {
    type: String,
    required: [true, 'Ward is required'],
    trim: true,
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
    },
    preferredContact: {
      type: String,
      trim: true,
    },
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
issueSchema.index({ status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ department: 1 });
issueSchema.index({ ward: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ 'location.coordinates': '2dsphere' }); // For geospatial queries

export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', issueSchema);