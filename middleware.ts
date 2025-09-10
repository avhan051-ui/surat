import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route access permissions
const routePermissions = {
  '/dashboard/user': ['Administrator'],
  '/dashboard/master-data': ['Administrator'],
  '/dashboard/pengaturan': ['Administrator'],
  // Add more routes and their allowed roles here
};

export function middleware(request: NextRequest) {
  const currentUser = getCurrentUser(request);
  
  // Allow access to login page for everyone
  if (request.nextUrl.pathname === '/login') {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // Redirect unauthenticated users to login
  if (!currentUser) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Admin can access everything
  if (currentUser.role === 'Administrator') {
    return NextResponse.next();
  }
  
  // Check if user has permission for the requested route
  const requiredRoles = routePermissions[request.nextUrl.pathname as keyof typeof routePermissions];
  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    // Redirect to unauthorized page if user doesn't have permission
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}

// Helper function to get current user from cookies
function getCurrentUser(request: NextRequest) {
  const cookieValue = request.cookies.get('currentUser')?.value;
  if (cookieValue) {
    try {
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (e) {
      console.error('Error parsing user from cookie:', e);
      return null;
    }
  }
  return null;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
};;