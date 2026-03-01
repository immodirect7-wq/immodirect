import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GdprBanner from "@/components/GdprBanner";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ImmoDirect - Immobilier Direct au Cameroun",
    description: "Plateforme P2P pour l'immobilier au Cameroun sans intermédiaires.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <Providers>
                    <Navbar />
                    <main className="min-h-screen bg-background">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </main>
                    <Footer />
                    <GdprBanner />
                </Providers>
            </body>
        </html>
    );
}
