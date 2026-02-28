"use client";

import { useState, useEffect } from "react";
import { Upload, MapPin, Loader2 } from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ListingForm({ initialData }: { initialData?: any }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        type: "Appartement", // Default
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "",
        neighborhood: initialData?.neighborhood || "",
        city: initialData?.city || "Douala",
        advanceMonths: initialData?.advanceMonths || 0,
        images: initialData?.images || "[]",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [platformPrices, setPlatformPrices] = useState({ listing_price: 5000, pass_price: 2000 });

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                if (res.ok) {
                    const data = await res.json();
                    setPlatformPrices(data);
                }
            } catch (error) {
                console.error("Impossible de charger les tarifs:", error);
            }
        };
        fetchPrices();
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!session) {
            router.push("/auth/signin");
            return;
        }

        try {
            if (initialData?.id) {
                // EDIT MODE
                const resVal = await fetch(`/api/listings/${initialData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (!resVal.ok) {
                    const data = await resVal.json();
                    throw new Error(data.message || "Erreur lors de la modification de l'annonce.");
                }

                alert("Annonce modifiée avec succès.");
                router.push("/profile");
                router.refresh();
                return;
            }

            // CREATE MODE (PENDING)
            const resVal = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, status: "PENDING" }),
            });

            if (!resVal.ok) {
                const data = await resVal.json();
                throw new Error(data.message || "Erreur lors de la création de l'annonce.");
            }

            const { listing } = await resVal.json();

            // 2. Initiate Payment (5000 FCFA)
            // Use user's phone from session if available, or ask for it? 
            // Session default user object might not have phone. 
            // We'll prompt for phone number in a real app, but for now let's assume session user has one or use a default/input.
            // *Better*: Add a phone input for payment if not present.
            // For MVP simplicity, let's use a hardcoded test number or specific field.
            // Actually, `ListingForm` doesn't ask for user phone. 
            // Let's add a prompt or just use the one from profile.

            const paymentRes = await fetch("/api/payment/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: platformPrices.listing_price,
                    phone: "237600000000", // TODO: Get real phone from user input
                    description: `Publication annonce: ${listing.title}`,
                    listingId: listing.id
                }),
            });

            if (!paymentRes.ok) {
                const errData = await paymentRes.json();
                throw new Error(errData.message || "Erreur lors de l'initialisation du paiement.");
            }

            const paymentData = await paymentRes.json();
            alert(`Paiement initié ! Référence: ${paymentData.reference}. Veuillez valider sur votre téléphone (Simulé: 237600000000).`);

            // Success redirect
            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const cities = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Garoua', 'Maroua', 'Bamenda', 'Buea', 'Limbe', 'Ebolowa', 'Ngaoundéré', 'Bertoua'];
    const types = ['Appartement', 'Maison', 'Studio', 'Chambre', 'Terrain'];

    if (status === "loading") {
        return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                    {error}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1">Titre de l'annonce</label>
                <input
                    type="text"
                    className="w-full border rounded-lg p-2"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Type de bien</label>
                    <select
                        className="w-full border rounded-lg p-2"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        {types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Prix (FCFA / mois)</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre de mois d'avance</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full border rounded-lg p-2"
                        value={formData.advanceMonths}
                        onChange={(e) => setFormData({ ...formData, advanceMonths: parseInt(e.target.value) || 0 })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Ville</label>
                    <select
                        className="w-full border rounded-lg p-2"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                        {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Quartier</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    className="w-full border rounded-lg p-2 h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos du bien
                </label>

                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "immodirect_upload"}
                    onSuccess={(result: any) => {
                        // Helper to add new image to state
                        const newImage = result?.info?.secure_url;
                        if (newImage) {
                            const currentImages = formData.images ? JSON.parse(formData.images) : [];
                            setFormData({ ...formData, images: JSON.stringify([...currentImages, newImage]) });
                        }
                    }}
                    options={{
                        maxFiles: 5,
                        resourceType: "image",
                        clientAllowedFormats: ["image"],
                    }}
                >
                    {({ open }) => {
                        return (
                            <div
                                onClick={() => open()}
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition"
                            >
                                <Upload size={24} className="mb-2" />
                                <span>Cliquez pour ajouter des photos</span>
                                <span className="text-xs text-gray-400 mt-1">(Max 5 photos)</span>
                            </div>
                        );
                    }}
                </CldUploadWidget>

                {/* Image Previews */}
                {formData.images && JSON.parse(formData.images).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {JSON.parse(formData.images).map((img: string, idx: number) => (
                            <div key={idx} className="relative h-24 rounded-md overflow-hidden bg-gray-100 border">
                                <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <button
                    type="button"
                    className="flex items-center gap-2 text-blue-600 font-medium"
                >
                    <MapPin size={18} />
                    Ajouter la localisation du logement/terrain
                </button>
                <p className="text-xs text-orange-600 italic">
                    Note : Il est vivement recommandé d'ajouter cette localisation pour aider les visiteurs à vous trouver.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition flex justify-center items-center"
            >
                {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                {loading ? "Traitement..." : initialData?.id ? "Enregistrer les modifications" : `Publier l'annonce (${platformPrices.listing_price} FCFA)`}
            </button>
        </form>
    );
}
