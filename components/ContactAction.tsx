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
    passPrice: number;  // 0 = accès gratuit aux contacts
}

export default function ContactAction({
    isUnlocked,
    ownerPhone,
    listingId,
    listingTitle,
    userPhone,
    passPrice,
}: ContactActionProps) {
    const [showPhone, setShowPhone] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const initiatePayment = async (amount: number, description: string, paymentReason: string, forListingId?: string) => {
        if (!confirm(`Initier un paiement de ${amount} FCFA ?`)) return;

        setLoading(true);
        try {
            const res = await fetch("/api/payment/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    description,
                    reason: paymentReason,
                    listingId: forListingId,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Erreur paiement");
            }

            const data = await res.json();
            if (data.authorization_url) {
                // Redirect to NotchPay checkout page
                window.location.href = data.authorization_url;
                return;
            }
            alert(`Paiement initié ! Référence: ${data.reference}.`);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Mode gratuit : accès contact direct pour tous
    if (passPrice === 0 || isUnlocked) {
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
                    Contact accessible gratuitement
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 text-center">Débloquer le contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loading ? (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-700 py-4 px-2 rounded-xl border border-blue-200">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="font-medium text-sm">Redirection vers le paiement sécurisé...</span>
                    </div>
                ) : (
                    <>
                        {/* Single Unlock Option */}
                        <button
                            onClick={() => initiatePayment(500, `Déblocage contact: ${listingTitle}`, "SINGLE_UNLOCK", listingId)}
                            disabled={loading}
                            className="flex flex-col items-center justify-center gap-1 bg-white border border-blue-200 text-blue-600 py-3 px-2 rounded-lg hover:bg-blue-50 transition hover:shadow-md group"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <Eye size={18} />
                                500 FCFA
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-500">Voir ce numéro</span>
                        </button>

                        {/* Monthly Pass Option */}
                        <button
                            onClick={() => initiatePayment(passPrice, "Pass Mensuel ImmoDirect", "PASS")}
                            disabled={loading}
                            className="flex flex-col items-center justify-center gap-1 bg-blue-600 text-white py-3 px-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <Lock size={18} />
                                {passPrice.toLocaleString()} FCFA
                            </div>
                            <span className="text-xs text-blue-100">Pass Illimité (1 mois)</span>
                        </button>
                    </>
                )}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
                Paiement sécurisé via Mobile Money (MTN/Orange)
            </p>
        </div>
    );
}
