"use client";

import { Flag, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ReportButtonProps {
    listingId: string;
}

export default function ReportButton({ listingId }: ReportButtonProps) {
    const [reported, setReported] = useState(false);

    const handleReport = () => {
        // Simulate report API call
        if (confirm("Voulez-vous signaler cette annonce comme suspecte ?")) {
            setReported(true);
            // API call to /api/reports would go here
        }
    };

    if (reported) {
        return (
            <div className="flex items-center gap-2 text-red-600 font-medium text-sm mt-4">
                <AlertTriangle size={16} />
                <span>Annonce signalée. Merci.</span>
            </div>
        )
    }

    return (
        <button
            onClick={handleReport}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm mt-4 transition"
        >
            <Flag size={16} />
            Signaler cette annonce
        </button>
    );
}
