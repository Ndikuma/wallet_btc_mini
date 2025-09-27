

"use client";

import { useEffect, useState } from 'react';
import LandingPage from './landing-page';
import MainLayout from './(main)/layout';
import DashboardPage from './(main)/dashboard/page';

export default function RootPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // This effect runs only on the client
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // While checking for authentication, render nothing to avoid flash of unstyled content
  if (isAuthenticated === null) {
    return null; 
  }

  if (isAuthenticated) {
    // If authenticated, render the main application layout and the dashboard.
    // The main layout contains the sidebar, header, and other core UI.
    return (
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    );
  }

  // If not authenticated, show the public landing page.
  return <LandingPage />;
}
