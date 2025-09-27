
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
    if (authStatus) {
      router.replace('/');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner
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
