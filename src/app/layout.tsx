import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import EmergencyBroadcastBanner from "@/components/EmergencyBroadcastBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import AutoReloadManager from "@/components/AutoReloadManager";
import RolePersonaSwitcher from "@/components/RolePersonaSwitcher";

export const viewport: Viewport = {
  themeColor: "#0c1824",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="text-[#05233b] antialiased min-h-screen relative overflow-x-hidden selection:bg-[#CFEAFF] selection:text-[#075080] bg-[#0c1824]">
        {/* Apple iOS 27 Liquid Glass Ambient Canvas with Ultra High-Definition 6K Fluid Wallpaper */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0c1824]">
          {/* Pristine 6000x4000 Full-Fidelity Wallpaper (Zero Quality Loss) */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{
              backgroundImage: "url('/background-ui.jpg')",
            }}
          />

          {/* Ultra-Subtle Ambient Lighting (No background blur to preserve 100% pin-sharp image resolution) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 pointer-events-none" />

          {/* Soft Center Top Specular Luster Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.25),transparent_75%)] pointer-events-none" />

          {/* Deep Ambient Vignette Around Viewport Borders for Contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_65%,rgba(7,24,39,0.3)_100%)] pointer-events-none" />
        </div>

        <AppProvider>
          <div className="flex min-h-screen flex-col pb-28 md:pb-8">
            <EmergencyBroadcastBanner />
            <Navigation />
            <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <PWAInstallPrompt />
            <AutoReloadManager />
            <RolePersonaSwitcher />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
