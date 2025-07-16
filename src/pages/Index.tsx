
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from '../components/Auth/AuthPage';
import { AppLayout } from '../components/Layout/AppLayout';
import { PWAInstallPrompt } from '../components/App/PWAInstallPrompt';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-medium mb-2">Loading TaskSync</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? <AppLayout /> : <AuthPage />}
      <PWAInstallPrompt />
    </>
  );
};

export default Index;
