import "./globals.css";

export const metadata = {
  title: "Umeed",
  description: "Sparking Hope • Empowering Tech",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark" style={{ colorScheme: 'dark' }}>
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5] antialiased">
        {/* Ambient top glowing mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#8b5cf6]/5 via-transparent to-transparent blur-[120px] pointer-events-none z-0" />
        
        <main className="flex-grow flex flex-col justify-center z-10 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
