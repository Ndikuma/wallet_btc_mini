

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from './landing-page';
import MainLayout from './(main)/layout';
import DashboardPage from './(main)/page';

export default function RootPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const authStatus = !!token;
    setIsAuthenticated(authStatus);
    if (!authStatus && window.location.pathname !== '/') {
        // If not authenticated and not on the landing page, you might want to redirect.
        // But middleware should handle this. Here we just set the state.
    }
  }, [router]);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner to prevent flash of unstyled content
  }

  if (isAuthenticated) {
    return (
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    );
  }

  return <LandingPage />;
}
