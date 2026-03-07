"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "failed" | "error">("loading");
    const [message, setMessage] = useState("Vérification du paiement en cours...");
    const [type, setType] = useState<string>("");

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get("reference") || "";
            const trxref = searchParams.get("trxref") || "";

            if (!reference && !trxref) {
                setStatus("error");
                setMessage("Aucune référence de paiement trouvée.");
                return;
            }

            try {
                const res = await fetch("/api/payment/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reference, trxref }),
                });

                const data = await res.json();

                if (data.status === "success") {
                    setStatus("success");
                    setMessage(data.message);
                    setType(data.type || "");
                } else if (data.status === "failed") {
                    setStatus("failed");
                    setMessage(data.message);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Erreur lors de la vérification.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Erreur de connexion au serveur.");
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Vérification en cours</h1>
                        <p className="text-gray-500">{message}</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                        <h1 className="text-xl font-bold text-green-700 mb-2">Paiement réussi !</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        {type === "pass" && (
                            <p className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
                                🎫 Votre Pass Illimité est maintenant actif. Vous pouvez voir tous les numéros de contact pendant 30 jours.
                            </p>
                        )}
                        {type === "listing" && (
                            <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3 mb-4">
                                📝 Votre annonce est maintenant publiée et visible par tous.
                            </p>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => router.push("/listings")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Voir les annonces
                            </button>
                            <button
                                onClick={() => router.push("/profile")}
                                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                            >
                                Mon profil
                            </button>
                        </div>
                    </>
                )}

                {(status === "failed" || status === "error") && (
                    <>
                        <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                        <h1 className="text-xl font-bold text-red-700 mb-2">
                            {status === "failed" ? "Paiement échoué" : "Erreur"}
                        </h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => router.push("/listings")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Réessayer
                            </button>
                            <button
                                onClick={() => router.push("/profile")}
                                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                            >
                                Mon profil
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentReturnPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}
