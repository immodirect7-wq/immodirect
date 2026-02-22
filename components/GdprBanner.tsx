"use client";

import { useState, useEffect } from "react";

export default function GdprBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("immodirect-gdpr-consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("immodirect-gdpr-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 text-white p-4 z-50">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-center md:text-left">
                    Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{" "}
                    <a href="/legal/cgu" className="underline hover:text-blue-400">politique de confidentialité</a>.
                </p>
                <button
                    onClick={handleAccept}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition whitespace-nowrap"
                >
                    Accepter
                </button>
            </div>
        </div>
    );
}
