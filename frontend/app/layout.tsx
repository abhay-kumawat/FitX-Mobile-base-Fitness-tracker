import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import MobileFrame from "@/components/MobileFrame";
import StarBackground from "@/components/StarBackground";
import ThemeInitializer from "@/components/ThemeInitializer";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Fit x - Hyper-Personalized Mobile Fitness & Recovery",
  description: "Elite Mobile Web App featuring AI Adaptive Workouts, Telemetry Readiness, Smart Meal & Todo Tracker, and Firebase Authentication.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="theme-wood antialiased min-h-screen">
        <AuthProvider>
          <ThemeInitializer />
          <StarBackground />
          <MobileFrame>
            <Navigation />
            <main className="space-y-4">
              {children}
            </main>
          </MobileFrame>
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
