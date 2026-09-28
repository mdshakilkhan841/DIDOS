'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import AdminWorkbench from './admin/AdminWorkbench';
import ClientWorkbench from './workspace/ClientWorkbench';

export default function Workbench({
  lang = 'en',
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // If still checking authentication or unauthenticated, show loading indicator
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--background)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontWeight: 500 }}>
          {lang === 'bn' ? 'ওয়ার্কস্পেস অনুমোদন যাচাই করা হচ্ছে…' : 'Verifying workspace authorization…'}
        </p>
      </div>
    );
  }

  // Complete Role Separation: Dedicated Admin Portal vs Client Portal
  if (user.role === 'admin') {
    return <AdminWorkbench lang={lang} section={section} />;
  }

  return <ClientWorkbench lang={lang} section={section} />;
}
