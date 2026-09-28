import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import EmergencyBroadcastBanner from "@/components/EmergencyBroadcastBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Campus Lenz — College Discovery, Experience & Social Network",
  description: "A trusted digital campus ecosystem combining college discovery, student/alumni experience data, social discussion, and direct communication.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Campus Lenz",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-[#0C2340] antialiased min-h-screen relative overflow-x-hidden selection:bg-sky-500/20 selection:text-sky-900">
        {/* Ambient Oceanic Glass Glow Elements */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-400/25 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full bg-teal-400/20 blur-3xl" />
        </div>

        <AppProvider>
          <div className="flex min-h-screen flex-col pb-24 md:pb-0">
            <EmergencyBroadcastBanner />
            <Navigation />
            <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <PWAInstallPrompt />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
