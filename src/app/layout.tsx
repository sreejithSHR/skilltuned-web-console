import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "VR Command Center",
  description: "Multi-tenant VR Console Command Center — control every headset from mission control",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>
          <div className="relative min-h-screen z-10">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
