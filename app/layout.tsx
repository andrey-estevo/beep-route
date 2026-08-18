import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beep Route — entregas no caminho certo",
  description: "Organize pacotes, otimize paradas e conclua suas entregas com confiança.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/beep-route.svg",
    apple: "/beep-route.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={geist.variable}>
        {children}
      </body>
    </html>
  );
}
