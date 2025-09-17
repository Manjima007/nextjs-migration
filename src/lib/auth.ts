import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  department?: string;
  ward?: string;
}

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token utilities
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Role-based access control utilities
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canAccessDepartment = (userRole: string, userDepartment: string | undefined, targetDepartment: string): boolean => {
  // City admin can access all departments
  if (userRole === 'city_admin') return true;
  
  // Department admin can only access their own department
  if (userRole === 'department_admin') return userDepartment === targetDepartment;
  
  // Field workers can only access their own department
  if (userRole === 'field_worker') return userDepartment === targetDepartment;
  
  return false;
};

export const canAccessWard = (userRole: string, userWard: string | undefined, targetWard: string): boolean => {
  // City admin can access all wards
  if (userRole === 'city_admin') return true;
  
  // Regional admin can only access their own ward
  if (userRole === 'regional_admin') return userWard === targetWard;
  
  return false;
};