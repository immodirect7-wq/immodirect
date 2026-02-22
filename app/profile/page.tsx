import prisma from "@/lib/prisma";
import VerificationRequest from "@/components/VerificationRequest";
import TrustBadge from "@/components/TrustBadge";

// Mock user for now
const MOCK_USER_ID = "user_123";

export default async function ProfilePage() {
    // In a real app, verify session
    const user = await prisma.user.findUnique({
        where: { id: MOCK_USER_ID },
    });

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-semibold text-lg">{user.phone}</h2>
                        <p className="text-gray-500 text-sm">{user.role === "OWNER" ? "Propriétaire" : "Chercheur"}</p>
                    </div>
                    <TrustBadge trustScore={user.trustScore} />
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Trust Score:</span>
                    <span className="font-bold text-blue-600">{user.trustScore}/100</span>
                </div>
            </div>

            {user.role === "OWNER" && (
                <div className="mb-6">
                    <h2 className="font-semibold mb-3">Vérification</h2>
                    {user.trustScore < 50 ? (
                        <VerificationRequest />
                    ) : (
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2">
                            <span>✅ Vous êtes un Propriétaire de Confiance</span>
                        </div>
                    )}

                </div>
            )}

            {user.role === "SEEKER" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h2 className="font-semibold mb-2">Mon Pass Visite</h2>
                    {user.hasActivePass ? (
                        <p className="text-green-600 font-medium">Actif (Expire le {user.passExpiry?.toLocaleDateString()})</p>
                    ) : (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full">Acheter un Pass (2000 FCFA)</button>
                    )}
                </div>
            )}
        </div>
    );
}
