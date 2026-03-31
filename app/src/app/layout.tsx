import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "-es+ · Ahorrá con lo que ya tenés",
  description: "Tu asistente de ahorro inteligente. Descuentos personalizados con tus tarjetas y billeteras.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "-es+" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4A5E3C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="facebook-domain-verification" content="r9gl6pxtgxrrqprltmhwms95yxq29j" />
      </head>
      <body>{children}</body>
    </html>
  );
}
