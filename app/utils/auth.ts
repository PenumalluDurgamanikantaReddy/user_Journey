import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * User authentication and authorization
 * Integrates with OAuth providers (Google, etc.)
 */

export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Verify JWT token from Authorization header
 */
export async function verifyToken(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );

    const verified = await jwtVerify(token, secret);
    return verified.payload as unknown as AuthUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    admin: 3,
    analyst: 2,
    viewer: 1,
  };

  return (roleHierarchy[user.role] || 0) >= (roleHierarchy[requiredRole] || 0);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

/**
 * Middleware: Require authentication
 */
export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Attach user to request context
    (request as any).user = user;
    return handler(request);
  };
}

/**
 * Middleware: Require specific role
 */
export function requireRole(requiredRole: string) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = await verifyToken(request);
      if (!user || !hasRole(user, requiredRole)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      (request as any).user = user;
      return handler(request);
    };
  };
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(permission: string) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = await verifyToken(request);
      if (!user || !hasPermission(user, permission)) {
        return NextResponse.json(
          { error: `Forbidden - Required permission: ${permission}` },
          { status: 403 }
        );
      }

      (request as any).user = user;
      return handler(request);
    };
  };
}

/**
 * Role definitions with permissions
 */
export const ROLE_DEFINITIONS: Record<string, { permissions: string[] }> = {
  admin: {
    permissions: [
      'read:all_data',
      'write:all_data',
      'delete:data',
      'manage:users',
      'view:costs',
      'manage:permissions',
    ],
  },
  analyst: {
    permissions: [
      'read:all_data',
      'write:data',
      'view:own_data',
      'export:data',
    ],
  },
  viewer: {
    permissions: [
      'read:all_data',
      'view:own_data',
    ],
  },
};
