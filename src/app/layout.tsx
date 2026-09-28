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
        {/* Ambient Pearlescent Glass Glow Elements matching reference */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          {/* Top-Left Mint / Emerald Aura */}
          <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-emerald-400/20 blur-[100px]" />
          {/* Center-Right Warm Apricot / Amber Aura */}
          <div className="absolute top-24 right-1/4 w-[36rem] h-[36rem] rounded-full bg-amber-300/18 blur-[120px]" />
          {/* Top-Right Soft Coral / Rose Aura */}
          <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-rose-300/15 blur-[100px]" />
          {/* Center-Bottom Soft Sky & Cyan Aura */}
          <div className="absolute bottom-20 left-1/3 w-[36rem] h-[36rem] rounded-full bg-sky-300/22 blur-[110px]" />
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
