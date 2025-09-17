import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from '../lib/mongodb';
import User from '../models/User';
import Department from '../models/Department';
import Issue from '../models/Issue';
import Analytics from '../models/Analytics';
import { hashPassword } from '../lib/auth';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Issue.deleteMany({});
    await Analytics.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users
    const users = [
      {
        name: 'John Citizen',
        email: 'citizen1@email.com',
        password: await hashPassword('demo123'),
        role: 'citizen',
        phone: '+1-555-0101',
        address: '123 Main St, Downtown',
      },
      {
        name: 'Mike Worker',
        email: 'worker1@contractor.com',
        password: await hashPassword('demo123'),
        role: 'field_worker',
        phone: '+1-555-0102',
        department: 'Sanitation',
      },
      {
        name: 'Sarah Admin',
        email: 'sanitation.head@city.gov',
        password: await hashPassword('demo123'),
        role: 'department_admin',
        phone: '+1-555-0103',
        department: 'Sanitation',
      },
      {
        name: 'Regional Manager',
        email: 'ward1.admin@city.gov',
        password: await hashPassword('demo123'),
        role: 'regional_admin',
        phone: '+1-555-0104',
        ward: 'Ward 1',
      },
      {
        name: 'City Administrator',
        email: 'admin@city.gov',
        password: await hashPassword('demo123'),
        role: 'city_admin',
        phone: '+1-555-0105',
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Created users:', createdUsers.length);

    // Create departments
    const departments = [
      {
        name: 'Sanitation',
        description: 'Waste management and street cleaning services',
        categories: ['sanitation', 'environment'],
        head: createdUsers.find(u => u.role === 'department_admin')?._id,
        workers: [createdUsers.find(u => u.role === 'field_worker')?._id],
        contactEmail: 'sanitation@city.gov',
        contactPhone: '+1-555-0201',
      },
      {
        name: 'Public Works',
        description: 'Infrastructure maintenance and repairs',
        categories: ['infrastructure', 'utilities'],
        head: createdUsers.find(u => u.role === 'department_admin')?._id,
        workers: [],
        contactEmail: 'publicworks@city.gov',
        contactPhone: '+1-555-0202',
      },
      {
        name: 'Transportation',
        description: 'Traffic management and road maintenance',
        categories: ['traffic', 'infrastructure'],
        head: createdUsers.find(u => u.role === 'department_admin')?._id,
        workers: [],
        contactEmail: 'transportation@city.gov',
        contactPhone: '+1-555-0203',
      },
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log('🏢 Created departments:', createdDepartments.length);

    // Create sample issues
    const issues = [
      {
        title: 'Broken streetlight on Main Street',
        description: 'The streetlight near the community center has been out for several days, creating safety concerns for pedestrians at night.',
        category: 'infrastructure',
        priority: 'high',
        status: 'pending',
        reportedBy: createdUsers.find(u => u.role === 'citizen')?._id,
        department: 'Public Works',
        location: {
          address: '456 Main St, Downtown',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        },
        ward: 'Ward 1',
        history: [{
          status: 'pending',
          changedBy: createdUsers.find(u => u.role === 'citizen')?._id,
          changedAt: new Date(),
          comment: 'Issue reported by citizen',
        }],
      },
      {
        title: 'Garbage not collected for 3 days',
        description: 'Our neighborhood garbage bins have not been emptied for three days. The bins are overflowing and attracting pests.',
        category: 'sanitation',
        priority: 'urgent',
        status: 'assigned',
        reportedBy: createdUsers.find(u => u.role === 'citizen')?._id,
        assignedTo: createdUsers.find(u => u.role === 'field_worker')?._id,
        department: 'Sanitation',
        location: {
          address: '789 Oak Avenue, Suburb',
          coordinates: {
            latitude: 40.7589,
            longitude: -73.9851,
          },
        },
        ward: 'Ward 1',
        history: [
          {
            status: 'pending',
            changedBy: createdUsers.find(u => u.role === 'citizen')?._id,
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            comment: 'Issue reported by citizen',
          },
          {
            status: 'assigned',
            changedBy: createdUsers.find(u => u.role === 'department_admin')?._id,
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            comment: 'Assigned to field worker for immediate attention',
          },
        ],
      },
      {
        title: 'Pothole causing traffic issues',
        description: 'Large pothole on Elm Street is causing vehicles to swerve and creating traffic congestion during rush hours.',
        category: 'traffic',
        priority: 'medium',
        status: 'resolved',
        reportedBy: createdUsers.find(u => u.role === 'citizen')?._id,
        assignedTo: createdUsers.find(u => u.role === 'field_worker')?._id,
        department: 'Transportation',
        location: {
          address: '321 Elm Street, Midtown',
          coordinates: {
            latitude: 40.7505,
            longitude: -73.9934,
          },
        },
        actualResolutionTime: new Date(),
        ward: 'Ward 1',
        feedback: {
          rating: 5,
          comment: 'Quick response and excellent work quality!',
          providedAt: new Date(),
        },
        history: [
          {
            status: 'pending',
            changedBy: createdUsers.find(u => u.role === 'citizen')?._id,
            changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            comment: 'Issue reported by citizen',
          },
          {
            status: 'assigned',
            changedBy: createdUsers.find(u => u.role === 'department_admin')?._id,
            changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            comment: 'Assigned to transportation department',
          },
          {
            status: 'in_progress',
            changedBy: createdUsers.find(u => u.role === 'field_worker')?._id,
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            comment: 'Work started on pothole repair',
          },
          {
            status: 'resolved',
            changedBy: createdUsers.find(u => u.role === 'field_worker')?._id,
            changedAt: new Date(),
            comment: 'Pothole repaired and road surface restored',
          },
        ],
      },
    ];

    const createdIssues = await Issue.insertMany(issues);
    console.log('🎫 Created issues:', createdIssues.length);

    // Create analytics entries
    const analytics = [
      {
        type: 'issue_created',
        entityId: createdIssues[0]._id,
        entityType: 'Issue',
        metadata: {
          category: 'infrastructure',
          department: 'Public Works',
          ward: 'Ward 1',
          priority: 'high',
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'issue_resolved',
        entityId: createdIssues[2]._id,
        entityType: 'Issue',
        metadata: {
          category: 'traffic',
          department: 'Transportation',
          ward: 'Ward 1',
          priority: 'medium',
          resolutionTime: 72, // hours
          rating: 5,
        },
        timestamp: new Date(),
      },
      {
        type: 'user_registered',
        entityId: createdUsers[0]._id,
        entityType: 'User',
        metadata: {
          userRole: 'citizen',
        },
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    await Analytics.insertMany(analytics);
    console.log('📊 Created analytics entries:', analytics.length);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('👤 Citizen: citizen1@email.com / demo123');
    console.log('🔧 Field Worker: worker1@contractor.com / demo123');
    console.log('👮 Department Admin: sanitation.head@city.gov / demo123');
    console.log('🏛️ Regional Admin: ward1.admin@city.gov / demo123');
    console.log('⚡ City Admin: admin@city.gov / demo123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();