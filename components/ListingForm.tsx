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
        propertyType: initialData?.propertyType || "Appartement",
        surface: initialData?.surface || "",
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
    const [contactPhone, setContactPhone] = useState(""); // Numéro de contact du propriétaire (obligatoire)
    const [phoneNumber, setPhoneNumber] = useState(""); // Numéro Mobile Money (paiement) - optionnel si prix > 0
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
    const [platformPrices, setPlatformPrices] = useState({ listing_price: 5000, pass_price: 2000 });

    // Pre-fill contact phone from user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data?.phone) setContactPhone(data.phone);
                }
            } catch { /* silent */ }
        };
        fetchProfile();
    }, []);

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

        // Validate contact phone
        if (!contactPhone || contactPhone.replace(/\D/g, "").length < 9) {
            setError("Veuillez entrer un numéro de téléphone de contact valide.");
            setLoading(false);
            return;
        }

        try {
            if (initialData?.id) {
                // EDIT MODE
                const resVal = await fetch(`/api/listings/${initialData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, images: JSON.stringify(imagesRef.current), contactPhone }),
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
                body: JSON.stringify({ ...formData, images: JSON.stringify(imagesRef.current), contactPhone, status: "PENDING" }),
            });

            if (!resVal.ok) {
                const data = await resVal.json();
                throw new Error(data.message || "Erreur lors de la création de l'annonce.");
            }

            const { listing } = await resVal.json();

            // If price is 0 (free mode), auto-publish immediately without payment
            if (platformPrices.listing_price === 0) {
                // Mark listing as PAID directly
                await fetch(`/api/listings/${listing.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "PAID" }),
                });
                setPaymentNote("✅ Annonce publiée gratuitement ! Elle est maintenant visible sur la plateforme.");
                return;
            }

            // 2. Initiate Payment with NotchPay - redirect to checkout
            try {
                const paymentRes = await fetch("/api/payment/init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: platformPrices.listing_price,
                        description: `Publication annonce: ${listing.title}`,
                        listingId: listing.id,
                        reason: "LISTING_FEE"
                    }),
                });

                if (paymentRes.ok) {
                    const paymentData = await paymentRes.json();
                    if (paymentData.authorization_url) {
                        // Redirect to NotchPay checkout page
                        window.location.href = paymentData.authorization_url;
                        return;
                    }
                    setPaymentNote(`✅ Paiement initié ! Référence: ${paymentData.reference}.`);
                } else {
                    setPaymentNote("⚠️ Votre annonce a été enregistrée mais le paiement n'a pas pu être initialisé. Contactez le support.");
                }
            } catch (payErr) {
                setPaymentNote("⚠️ Votre annonce a été enregistrée. Merci de contacter le support pour confirmer le paiement.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const cities = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Garoua', 'Maroua', 'Bamenda', 'Buea', 'Limbe', 'Ebolowa', 'Ngaoundéré', 'Bertoua'];
    const types = ['Appartement', 'Maison', 'Boutique', 'Studio', 'Chambre', 'Terrain', 'Bureau'];

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
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    >
                        {types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                {formData.propertyType === 'Boutique' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Superficie (m²)</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border rounded-lg p-2"
                            value={formData.surface}
                            onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                            required={formData.propertyType === 'Boutique'}
                            placeholder="ex: 25"
                        />
                    </div>
                )}
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
                <label className="block text-sm font-medium mb-1">
                    N° Téléphone de contact <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-colors">
                    <span className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r">+237</span>
                    <input
                        type="tel"
                        placeholder="600000000"
                        value={contactPhone.replace(/^237/, "")}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            setContactPhone(`237${raw}`);
                        }}
                        className="flex-1 px-3 py-2 outline-none text-sm"
                        required
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1 mb-4">Ce numéro sera communiqué aux locataires intéressés.</p>
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

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Photos du logement <span className="text-gray-400">(recommandé)</span>
                </label>
                <CldUploadWidget
                    uploadPreset="immodirect_upload"
                    options={{
                        maxFiles: 8,
                        sources: ["local", "camera"],
                        multiple: true,
                    }}
                    onSuccess={(result: any) => {
                        if (result.info?.secure_url) {
                            const newImages = [...imagesRef.current, result.info.secure_url];
                            imagesRef.current = newImages;
                            setImages(newImages);
                        }
                    }}
                    onUpload={(result: any) => {
                        if (result.info?.secure_url) {
                            const newImages = [...imagesRef.current, result.info.secure_url];
                            imagesRef.current = newImages;
                            setImages(newImages);
                        }
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-blue-50/50 transition-all cursor-pointer group"
                        >
                            <Upload size={28} className="mx-auto mb-2 text-gray-400 group-hover:text-primary transition-colors" />
                            <p className="text-sm font-medium text-gray-600 group-hover:text-primary">
                                Cliquez pour ajouter des photos
                            </p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG — 8 photos max</p>
                        </button>
                    )}
                </CldUploadWidget>

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {images.map((url, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                                <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newImages = images.filter((_, i) => i !== idx);
                                        imagesRef.current = newImages;
                                        setImages(newImages);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* VTC-style Location Picker */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    📍 Localisation du logement
                </h3>
                <p className="text-xs text-slate-500">
                    Ajoutez la position GPS pour que les locataires puissent trouver votre bien facilement — comme dans Uber ou Yango !
                </p>
                <LocationPickerModal
                    onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    initialLat={formData.latitude ?? undefined}
                    initialLng={formData.longitude ?? undefined}
                />
            </div>

            {platformPrices.listing_price > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        💳 Frais de publication : <strong>{platformPrices.listing_price.toLocaleString()} FCFA</strong>.
                        Après soumission, vous serez redirigé vers la page de paiement sécurisé (MTN MoMo, Orange Money, Carte bancaire).
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition flex justify-center items-center"
            >
                {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                {loading ? "Traitement..." : initialData?.id ? "Enregistrer les modifications" : platformPrices.listing_price === 0 ? "Publier l'annonce gratuitement" : `Publier l'annonce (${platformPrices.listing_price} FCFA)`}
            </button>
        </form>
    );
}
