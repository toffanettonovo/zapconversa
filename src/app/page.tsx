'use client';

import ChatLayout from '@/components/chat-layout';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

function AuthWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (user) {
    return <ChatLayout />;
  }

  return null;
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}
