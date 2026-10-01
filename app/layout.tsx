import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "./dudos.css";

export const metadata: Metadata = {
  title: {
    default: "DUDOS — Digital business, connected",
    template: "%s | DUDOS",
  },
  description:
    "Plan and build connected websites, commerce and business operations with DUDOS.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className="antialiased bg-white text-[#162c38]" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
