"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlatformSettings() {
    const [prices, setPrices] = useState<{ listing_price: number; pass_price: number; free_contact?: number }>({ listing_price: 0, pass_price: 0, free_contact: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setPrices(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prices),
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Les tarifs ont été mis à jour avec succès." });
                router.refresh();
            } else {
                setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Une erreur est survenue." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Tarification de la Plateforme</h2>
                <p className="text-gray-500 text-sm mt-1">Gérez les prix des services proposés aux utilisateurs.</p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
                {message.text && (
                    <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Prix de Publication d'une Annonce (FCFA)
                        </label>
                        <p className="text-xs text-slate-500 mb-2">Montant payé par les propriétaires ou chercheurs pour mettre un bien en ligne.</p>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={prices.listing_price}
                                onChange={(e) => setPrices({ ...prices, listing_price: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors pr-16"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">FCFA</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Prix du Pass Visite (FCFA / Mois)
                        </label>
                        <p className="text-xs text-slate-500 mb-2">Montant payé par les locataires pour accéder aux contacts des propriétaires en illimité.</p>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={prices.pass_price}
                                onChange={(e) => setPrices({ ...prices, pass_price: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors pr-16"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">FCFA</span>
                        </div>
                    </div>

                    {/* Free Contact Toggle */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Déblocage des contacts gratuit</label>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Si activé, tous les utilisateurs connectés peuvent voir le numéro de téléphone des propriétaires gratuitement.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPrices({ ...prices, free_contact: prices.free_contact ? 0 : 1 })}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${prices.free_contact ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${prices.free_contact ? 'translate-x-8' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <p className={`text-xs mt-2 font-medium ${prices.free_contact ? 'text-green-600' : 'text-slate-400'}`}>
                            {prices.free_contact ? '✅ Contacts gratuits — actif' : '🔒 Contacts payants — actif'}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer les tarifs
                    </button>
                </div>
            </form>
        </div>
    );
}
