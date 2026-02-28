"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LocationPickerModal from "./LocationPickerModal";

export default function ListingForm({ initialData }: { initialData?: any }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        type: "Appartement",
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "",
        neighborhood: initialData?.neighborhood || "",
        city: initialData?.city || "Douala",
        advanceMonths: initialData?.advanceMonths || 0,
        latitude: initialData?.latitude || null as number | null,
        longitude: initialData?.longitude || null as number | null,
    });
    // Track images separately with a ref AND state to avoid stale closures in Cloudinary widget
    const [images, setImages] = useState<string[]>(() => {
        try { return JSON.parse(initialData?.images || "[]"); } catch { return []; }
    });
    const imagesRef = useRef<string[]>(images);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
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
                    body: JSON.stringify({ ...formData, images: JSON.stringify(imagesRef.current) }),
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
                body: JSON.stringify({ ...formData, images: JSON.stringify(imagesRef.current), status: "PENDING" }),
            });

            if (!resVal.ok) {
                const data = await resVal.json();
                throw new Error(data.message || "Erreur lors de la création de l'annonce.");
            }

            const { listing } = await resVal.json();

            // 2. Initiate Payment - non-blocking if CamPay not configured
            if (phoneNumber) {
                try {
                    const paymentRes = await fetch("/api/payment/init", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            amount: platformPrices.listing_price,
                            phone: phoneNumber,
                            description: `Publication annonce: ${listing.title}`,
                            listingId: listing.id
                        }),
                    });

                    if (paymentRes.ok) {
                        const paymentData = await paymentRes.json();
                        setPaymentNote(`✅ Demande de paiement envoyée ! Référence: ${paymentData.reference}. Veuillez valider sur votre téléphone.`);
                    } else {
                        setPaymentNote("⚠️ Votre annonce a été enregistrée mais le paiement n'a pas pu être initialisé. Contactez le support.");
                    }
                } catch (payErr) {
                    setPaymentNote("⚠️ Votre annonce a été enregistrée. Merci de contacter le support pour confirmer le paiement.");
                }
            } else {
                setPaymentNote("✅ Annonce enregistrée avec succès ! Elle sera visible après validation du paiement.");
            }
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

    // If payment note is shown, the listing was created - show confirmation
    if (paymentNote) {
        return (
            <div className="max-w-lg mx-auto p-8 text-center space-y-4">
                <div className={`p-5 rounded-2xl text-sm font-medium ${paymentNote.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-orange-50 text-orange-800 border border-orange-200'
                    }`}>
                    {paymentNote}
                </div>
                <button
                    onClick={() => { router.push('/profile'); router.refresh(); }}
                    className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Voir mes annonces
                </button>
            </div>
        );
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
                        const newImage = result?.info?.secure_url;
                        if (newImage) {
                            // Use ref to avoid stale closure - always has latest images
                            const updated = [...imagesRef.current, newImage];
                            imagesRef.current = updated;
                            setImages(updated);
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
                                <span className="text-xs text-gray-400 mt-1">({images.length}/5 photos)</span>
                            </div>
                        );
                    }}
                </CldUploadWidget>

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {images.map((img: string, idx: number) => (
                            <div key={idx} className="relative h-24 rounded-md overflow-hidden bg-gray-100 border group">
                                <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = images.filter((_, i) => i !== idx);
                                        imagesRef.current = updated;
                                        setImages(updated);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <LocationPickerModal
                    onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    initialLat={formData.latitude || undefined}
                    initialLng={formData.longitude || undefined}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    N° Téléphone Mobile Money (pour le paiement)
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-colors">
                    <span className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r">+237</span>
                    <input
                        type="tel"
                        placeholder="600000000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.startsWith("237") ? e.target.value : `237${e.target.value.replace(/^0+/, '')}`)}
                        className="flex-1 px-3 py-2 outline-none text-sm"
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1">MTN MoMo ou Orange Money. Requis pour valider votre publication.</p>
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
