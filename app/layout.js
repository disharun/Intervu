import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Intervu",
  description: "AI-Powered Interview Practice Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background text-foreground">
              <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Intervu
                      </h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                      <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Dashboard
                      </Link>
                    </nav>
                  </div>
                  <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <UserButton />
                  </div>
                </div>
              </header>
              <main className="container mx-auto px-4 py-8">{children}</main>
              <footer className="border-t">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Intervu. All rights reserved.
                </div>
              </footer>
            </div>
            <Toaster position="top-center" />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
