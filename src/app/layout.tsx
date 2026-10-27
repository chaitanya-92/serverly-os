import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serverly OS — Your community, your architecture",
  description: "Design, customize, and prepare your Discord community with Serverly OS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}