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
      <body className="text-[#0C2340] antialiased min-h-screen relative overflow-x-hidden selection:bg-teal-500/20 selection:text-teal-900 bg-[#EEF4F8]">
        {/* Apple-Inspired Liquid Glass Ambient Canvas */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#EDF3F8]">
          {/* Liquid Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E2EDF8] via-[#EBF4FA] to-[#F1EEF9]" />
          
          {/* Liquid Orb 1: Deep Ocean Cerulean & Cyan Wave */}
          <div className="absolute -top-40 left-1/4 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-sky-400/35 via-cyan-400/30 to-blue-500/20 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
          
          {/* Liquid Orb 2: Soft Lilac & Rose Peach Caustic */}
          <div className="absolute top-1/3 -right-20 w-[42rem] h-[42rem] rounded-full bg-gradient-to-bl from-pink-400/25 via-rose-300/20 to-purple-400/25 blur-[140px]" />
          
          {/* Liquid Orb 3: Fresh Emerald / Mint Oceanic Aura */}
          <div className="absolute -bottom-32 -left-20 w-[48rem] h-[48rem] rounded-full bg-gradient-to-tr from-teal-300/25 via-emerald-400/20 to-sky-300/25 blur-[140px]" />

          {/* Liquid Orb 4: Center Specular Luster Glow */}
          <div className="absolute top-1/2 left-1/3 w-[36rem] h-[36rem] rounded-full bg-gradient-to-r from-blue-300/20 via-indigo-200/15 to-transparent blur-[120px]" />

          {/* Subtle Apple Liquid Mesh Noise / Specular Micro-Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.7),transparent_70%)]" />
        </div>

        <AppProvider>
          <div className="flex min-h-screen flex-col pb-24 md:pb-0">
            <EmergencyBroadcastBanner />
            <Navigation />
            <main className="flex-1 w-full max-w-[1560px] mx-auto px-3 sm:px-6 py-3 sm:py-5">
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
