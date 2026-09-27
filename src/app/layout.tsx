import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import RolePersonaSwitcher from "@/components/RolePersonaSwitcher";
import EmergencyBroadcastBanner from "@/components/EmergencyBroadcastBanner";

export const metadata: Metadata = {
  title: "Campus Lenz — College Discovery, Experience & Social Network",
  description: "A trusted digital campus ecosystem combining college discovery, student/alumni experience data, social discussion, and direct communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased">
        <AppProvider>
          <div className="flex min-h-screen flex-col pb-20 md:pb-0">
            <EmergencyBroadcastBanner />
            <Navigation />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <RolePersonaSwitcher />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
