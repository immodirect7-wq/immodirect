"use client";

import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";

export default function VerificationRequest() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"IDLE" | "submitting" | "success">("IDLE");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setStatus("submitting");
        // Simulate API call
        setTimeout(() => {
            setStatus("success");
        }, 2000);
    };

    if (status === "success") {
        return (
            <div className="bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle className="text-green-600 w-12 h-12 mx-auto mb-2" />
                <h3 className="font-bold text-green-800">Demande envoyée !</h3>
                <p className="text-green-700">Votre badge "Propriétaire de Confiance" sera activé après validation.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-bold text-lg mb-4">Devenir Propriétaire de Confiance</h3>
            <p className="text-gray-600 mb-4 text-sm">
                Augmentez vos chances de louer en vérifiant votre identité (Facture Eneo/Camwater ou CNI).
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center">
                <input
                    type="file"
                    id="verification-file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                />
                <label htmlFor="verification-file" className="cursor-pointer flex flex-col items-center">
                    <Upload className="text-gray-400 w-8 h-8 mb-2" />
                    <span className="text-blue-600 font-medium">
                        {file ? file.name : "Téléverser un document"}
                    </span>
                </label>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!file || status === "submitting"}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
                {status === "submitting" ? "Envoi..." : "Envoyer la demande"}
            </button>
        </div>
    );
}
