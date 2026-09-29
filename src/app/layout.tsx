import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import ThemeCanvas from "@/components/ThemeCanvas";
import ThemeCustomizerModal from "@/components/ThemeCustomizerModal";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import EmergencyBroadcastBanner from "@/components/EmergencyBroadcastBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import AutoReloadManager from "@/components/AutoReloadManager";
import RolePersonaSwitcher from "@/components/RolePersonaSwitcher";
import Footer from "@/components/Footer";

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
        <ThemeProvider>
          {/* Dynamic Theme Canvas & Wallpaper */}
          <ThemeCanvas />

          <AppProvider>
            <div className="flex min-h-screen flex-col pb-28 md:pb-8">
              <EmergencyBroadcastBanner />
              <Navigation />
              <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
              <Footer />
              <PWAInstallPrompt />
              <AutoReloadManager />
              <RolePersonaSwitcher />
              <ThemeCustomizerModal />
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
