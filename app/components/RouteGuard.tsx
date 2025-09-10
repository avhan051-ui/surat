'use client';

import { useAppContext } from '@/app/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function RouteGuard({ 
  children, 
  requiredRole
}: RouteGuardProps) {
  const { currentUser } = useAppContext();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Check if specific role is required
    if (requiredRole && currentUser.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    // If all checks pass, stop checking
    setIsChecking(false);
  }, [currentUser, requiredRole, router]);

  // If user is administrator, they can access everything
  if (currentUser?.role === 'Administrator') {
    return <>{children}</>;
  }

  // If no specific requirements, just check if user is logged in
  if (!requiredRole && currentUser) {
    return <>{children}</>;
  }

  // Check role requirements
  if (requiredRole && currentUser?.role === requiredRole) {
    return <>{children}</>;
  }

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we reach here, it means access is denied
  return null;
}