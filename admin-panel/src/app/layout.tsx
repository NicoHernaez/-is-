import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "-es+ Admin",
  description: "Panel de administración de -es+",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
