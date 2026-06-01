import "./globals.css";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata = {
  title: "Umeed",
  description: "Personal social media posting tool",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={geist.variable} suppressHydrationWarning>
      <body className="app-shell">
        <ThemeProvider>
          <Navbar />
          <main className="page-container">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
