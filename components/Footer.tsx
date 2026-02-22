import Link from "next/link";
import { Facebook, Twitter, Instagram, CreditCard } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Column 1: About */}
                <div>
                    <h3 className="text-white font-bold text-xl mb-4">À propos d'ImmoDirect</h3>
                    <p className="text-slate-400 mb-4">
                        La première plateforme immobilière sans intermédiaire au Cameroun.
                        Trouvez votre logement idéal ou louez votre bien en toute simplicité.
                    </p>
                    <div className="flex gap-4">
                        <Facebook className="hover:text-primary cursor-pointer transition-colors" />
                        <Twitter className="hover:text-primary cursor-pointer transition-colors" />
                        <Instagram className="hover:text-primary cursor-pointer transition-colors" />
                    </div>
                </div>

                {/* Column 2: Legal & Support */}
                <div>
                    <h3 className="text-white font-bold text-xl mb-4">Légal & Support</h3>
                    <ul className="space-y-2">
                        <li><Link href="/legal/cgu" className="hover:text-primary transition-colors">Conditions Générales (CGU)</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Politique de Confidentialité</Link></li>
                        <li><Link href="/help" className="hover:text-primary transition-colors">Aide & FAQ</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Nous contacter</Link></li>
                    </ul>
                </div>

                {/* Column 3: Secure Payments */}
                <div>
                    <h3 className="text-white font-bold text-xl mb-4">Paiements Sécurisés</h3>
                    <p className="text-slate-400 mb-4">Nous acceptons les paiements mobile money sécurisés.</p>
                    <div className="flex gap-4 items-center">
                        <div className="bg-white p-2 rounded">
                            <span className="font-bold text-yellow-500">MTN</span>
                        </div>
                        <div className="bg-white p-2 rounded">
                            <span className="font-bold text-orange-500">Orange</span>
                        </div>
                        <CreditCard className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} ImmoDirect. Tous droits réservés.
            </div>
        </footer>
    );
}
