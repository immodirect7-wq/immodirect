import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { Toaster } from "@/components/ui/toaster"; // Will add later
import Navbar from "@/components/Navbar";
import GdprBanner from "@/components/GdprBanner";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

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
                        {children}
                    </main>
                    <Footer />
                    <GdprBanner />
                    {/* <Toaster /> */}
                </Providers>
            </body>
        </html>
    );
}
