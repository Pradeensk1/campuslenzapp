import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import Navigation from "@/components/Navigation";

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
      <body className="bg-[#07111F] text-[#F8FAFC] antialiased">
        <AppProvider>
          <div className="flex min-h-screen flex-col pb-20 md:pb-0">
            <Navigation />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
