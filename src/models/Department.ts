import mongoose from 'mongoose';

export interface IDepartment extends mongoose.Document {
  _id: string;
  name: string;
  description: string;
  categories: string[]; // Categories this department handles
  head: mongoose.Schema.Types.ObjectId; // Reference to department admin
  workers: mongoose.Schema.Types.ObjectId[]; // References to field workers
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new mongoose.Schema<IDepartment>({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Department description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  categories: [{
    type: String,
    enum: ['sanitation', 'infrastructure', 'utilities', 'traffic', 'environment', 'safety', 'other'],
  }],
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Department head is required'],
  },
  workers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
departmentSchema.index({ name: 1 });
departmentSchema.index({ categories: 1 });
departmentSchema.index({ head: 1 });

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);