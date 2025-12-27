// app/layout.js
import "./globals.css";

export const metadata = {
  title: "SheetCMS - Premium Content Management",
  description: "Modern content management system with Google Sheets integration",
  keywords: ["CMS", "Content Management", "Google Sheets", "Dashboard"],
  authors: [{ name: "Your Name" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0B0D10",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0B0D10" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
