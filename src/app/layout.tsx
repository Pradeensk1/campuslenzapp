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
      <body className="text-[#075080] antialiased min-h-screen relative overflow-x-hidden selection:bg-[#CFEAFF] selection:text-[#075080] bg-[#0c1824]">
        {/* Apple iOS 27 Liquid Glass Ambient Canvas with User Fluid Marble Wallpaper */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0c1824]">
          {/* High-Resolution Fluid Wallpaper */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-[1.02]"
            style={{
              backgroundImage: "url('/background-ui.png')",
              filter: "saturate(1.22) contrast(1.08) brightness(0.96)",
            }}
          />

          {/* Frosted Glass Ambient Lighting & Diffusion Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F5FBFF]/20 via-transparent to-[#075080]/30 backdrop-blur-[0.5px] pointer-events-none" />

          {/* Soft Center Top Specular Luster Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.35),transparent_75%)] pointer-events-none" />

          {/* Deep Ambient Vignette Around Viewport Borders for Contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_65%,rgba(7,24,39,0.35)_100%)] pointer-events-none" />
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
