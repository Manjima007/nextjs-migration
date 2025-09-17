"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
          success: {
            style: {
              border: '1px solid #22c55e',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </AuthProvider>
  );
}