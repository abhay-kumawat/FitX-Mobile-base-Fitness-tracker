"use client";

import React, { useState, useEffect } from "react";
import { AuthFlowContainer } from "@/components/auth/AuthFlowContainer";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-smooth-reveal">
      <AuthFlowContainer
        initialScreen="welcome"
        isModal={true}
        onCloseModal={onClose}
        onSuccess={() => onClose()}
      />
    </div>
  );
}
