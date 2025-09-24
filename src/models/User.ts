import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'citizen' | 'field_worker' | 'department_admin' | 'regional_admin' | 'city_admin' | 'super_admin';
  phone?: string;
  address?: string;
  department?: string; // For workers and admins
  ward?: string; // For regional admins
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['citizen', 'field_worker', 'department_admin', 'regional_admin', 'city_admin', 'super_admin'],
    required: [true, 'Role is required'],
    default: 'citizen',
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
    // Required for workers and department admins
    required: function(this: IUser) {
      return this.role === 'field_worker' || this.role === 'department_admin';
    },
  },
  ward: {
    type: String,
    trim: true,
    // Required for regional admins
    required: function(this: IUser) {
      return this.role === 'regional_admin';
    },
  },
  profileImage: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ ward: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);