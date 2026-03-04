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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://immodirect.vercel.app"),
    title: {
        default: "ImmoDirect - Immobilier Direct au Cameroun",
        template: "%s | ImmoDirect",
    },
    description: "Trouvez, vendez ou louez votre bien immobilier sans intermédiaire au Cameroun. Appartements, maisons, studios et terrains à Douala, Yaoundé et partout au Cameroun.",
    keywords: [
        "immobilier Cameroun", "location Douala", "appartement Yaoundé",
        "maison à louer Cameroun", "terrain Cameroun", "studio Douala",
        "ImmoDirect", "immobilier sans intermédiaire", "location directe",
        "louer maison Douala", "louer appartement Yaoundé"
    ],
    applicationName: "ImmoDirect",
    authors: [{ name: "ImmoDirect" }],
    openGraph: {
        type: "website",
        locale: "fr_CM",
        siteName: "ImmoDirect",
        title: "ImmoDirect - Immobilier Direct au Cameroun",
        description: "Trouvez, vendez ou louez votre bien immobilier sans intermédiaire au Cameroun.",
        images: [
            {
                url: "/logo.png",
                width: 512,
                height: 512,
                alt: "ImmoDirect - Immobilier au Cameroun",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ImmoDirect - Immobilier Direct au Cameroun",
        description: "Trouvez, vendez ou louez votre bien immobilier sans intermédiaire au Cameroun.",
        images: ["/logo.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        // Add your Google Search Console verification code here once you have it
        // google: "your-google-verification-code",
    },
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
