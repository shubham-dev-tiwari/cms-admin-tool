// app/layout.js
import "./globals.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Canonical domain */}
        
        <link rel="canonical" href="https://ai.arlox.io" />

        {/* Not required, but okay to add */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
