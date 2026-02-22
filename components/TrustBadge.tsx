import { ShieldCheck } from "lucide-react";

interface TrustBadgeProps {
    trustScore: number;
}

export default function TrustBadge({ trustScore }: TrustBadgeProps) {
    // Logic to determine trust level
    // Example: Trust score > 50 means "Propriétaire de Confiance"

    const isTrusted = trustScore >= 50;

    if (!isTrusted) return null;

    return (
        <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            <ShieldCheck size={14} />
            <span>Propriétaire de Confiance</span>
        </div>
    );
}
