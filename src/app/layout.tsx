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
      <body className="text-[#075080] antialiased min-h-screen relative overflow-x-hidden selection:bg-[#CFEAFF] selection:text-[#075080] bg-[#F5FBFF]">
        {/* Apple-Inspired Liquid Frosted Glass Ambient Canvas (Strictly Monochromatic Ocean Blue & Frosted White) */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#F5FBFF]">
          {/* Liquid Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5FBFF] via-[#E8F5FF] to-[#E0F2FE]" />
          
          {/* Liquid Orb 1: Primary Ocean Blue & Cyan Wave */}
          <div className="absolute -top-40 left-1/4 w-[48rem] h-[48rem] rounded-full bg-gradient-to-tr from-[#3B9FE8]/25 via-[#8CCCF5]/30 to-[#1687D4]/20 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
          
          {/* Liquid Orb 2: Soft Light Ocean Blue Caustic */}
          <div className="absolute top-1/3 -right-20 w-[42rem] h-[42rem] rounded-full bg-gradient-to-bl from-[#8CCCF5]/25 via-[#CFEAFF]/30 to-[#3B9FE8]/20 blur-[140px]" />
          
          {/* Liquid Orb 3: Deep Ocean Navy Ambient Mist */}
          <div className="absolute -bottom-32 -left-20 w-[50rem] h-[50rem] rounded-full bg-gradient-to-tr from-[#0875BD]/15 via-[#8CCCF5]/25 to-[#CFEAFF]/30 blur-[150px]" />

          {/* Liquid Orb 4: Center Specular Luster Glow */}
          <div className="absolute top-1/2 left-1/3 w-[38rem] h-[38rem] rounded-full bg-gradient-to-r from-[#CFEAFF]/30 via-[#E8F5FF]/40 to-transparent blur-[120px]" />

          {/* Specular Micro-Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.85),transparent_70%)]" />
        </div>

        <AppProvider>
          <div className="flex min-h-screen flex-col pb-20 md:pb-0">
            <EmergencyBroadcastBanner />
            <Navigation />
            <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
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
