import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pareto Builders — Marketplace de AI Builders",
  description: "Encontre os melhores implementadores de IA para o seu negócio. Conectando empresas a AI Builders certificados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
