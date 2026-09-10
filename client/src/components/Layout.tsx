import React, { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoadingState from './LoadingState';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  requireAuth = false,
  showSidebar = false,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [requireAuth, isAuthenticated, isLoading, navigate]);

  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <LoadingState message="Loading your workspace..." fullHeight />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="flex flex-1 w-full">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 min-w-0 ${showSidebar ? '' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const PublicLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout requireAuth={false} showSidebar={false}>
      {children}
    </Layout>
  );
};

export const ProtectedLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout requireAuth={true} showSidebar={true}>
      {children}
    </Layout>
  );
};

export default Layout;
