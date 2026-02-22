"use client";

import { useState } from "react";
import { Phone, Lock, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContactActionProps {
    isUnlocked: boolean;
    ownerPhone: string;
    listingId: string;
    listingTitle: string;
    userPhone: string;
}

export default function ContactAction({
    isUnlocked,
    ownerPhone,
    listingId,
    listingTitle,
    userPhone,
}: ContactActionProps) {
    const [showPhone, setShowPhone] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const initiatePayment = async (amount: number, description: string) => {
        if (!userPhone) {
            alert("Veuillez remplir votre profil avec un numéro de téléphone pour payer.");
            // In real app, prompt for phone here if missing
            return;
        }

        if (!confirm(`Initier un paiement de ${amount} FCFA ?`)) return;

        setLoading(true);
        try {
            const res = await fetch("/api/payment/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    phone: userPhone,
                    description,
                    listingId: amount === 500 ? listingId : undefined, // Attach listingId only for single unlock
                    reason: amount === 500 ? "SINGLE_UNLOCK" : "MONTHLY_PASS"
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Erreur paiement");
            }

            const data = await res.json();
            alert(`Paiement initié ! Référence: ${data.reference}. Validez sur votre mobile.`);

            // In a real app we'd poll for status or listen to websocket
            // For now, let's just reload after a delay or let user reload

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isUnlocked) {
        return (
            <div className="flex flex-col gap-3 mt-4">
                <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
                >
                    <Phone size={20} />
                    {showPhone ? ownerPhone : "Afficher le numéro"}
                </button>
                <p className="text-center text-sm text-green-600 font-medium">
                    Contact accessible (Payé/Inclus)
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 text-center">Débloquer le contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Single Unlock Option */}
                <button
                    onClick={() => initiatePayment(500, `Déblocage contact: ${listingTitle}`)}
                    disabled={loading}
                    className="flex flex-col items-center justify-center gap-1 bg-white border border-blue-200 text-blue-600 py-3 px-2 rounded-lg hover:bg-blue-50 transition hover:shadow-md group"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                            <div className="flex items-center gap-2 font-bold">
                                <Eye size={18} />
                                500 FCFA
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-500">Voir ce numéro</span>
                        </>
                    )}
                </button>

                {/* Monthly Pass Option */}
                <button
                    onClick={() => initiatePayment(2000, "Pass Mensuel ImmoDirect")}
                    disabled={loading}
                    className="flex flex-col items-center justify-center gap-1 bg-blue-600 text-white py-3 px-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                            <div className="flex items-center gap-2 font-bold">
                                <Lock size={18} />
                                2 000 FCFA
                            </div>
                            <span className="text-xs text-blue-100">Pass Illimité (1 mois)</span>
                        </>
                    )}
                </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
                Paiement sécurisé via Mobile Money (MTN/Orange)
            </p>
        </div>
    );
}
