"use client";

import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
    const [activeTab, setActiveTab] = useState<"louer" | "acheter">("louer");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    return (
        <section className="relative w-full h-[600px] flex items-center justify-center">
            {/* Background Map/Image Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')"
                }}
            >
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center space-y-8">

                {/* Hero Titles */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
                        Trouvez votre logement sans intermédiaire.
                    </h1>
                    <p className="text-xl text-blue-50 md:text-2xl font-medium drop-shadow-md">
                        En direct de particulier à particulier, sans frais d'agence.
                    </p>
                </div>

                {/* Central Search Box (SeLoger Style) */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden mt-8">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("louer")}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "louer" ? "text-primary border-b-4 border-primary bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            Louer
                        </button>
                        <button
                            onClick={() => setActiveTab("acheter")}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "acheter" ? "text-primary border-b-4 border-primary bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            Acheter
                        </button>
                    </div>

                    <form
                        className="p-4 md:p-6 flex flex-col md:flex-row gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                router.push(`/listings?q=${encodeURIComponent(searchQuery)}&type=${activeTab}`);
                            } else {
                                router.push(`/listings?type=${activeTab}`);
                            }
                        }}
                    >
                        {/* Location Input */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <MapPin className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Où cherchez-vous ? (ex: Douala, Yaoundé...)"
                                className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-xl text-gray-800 font-medium placeholder-gray-500 focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="bg-secondary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:bg-orange-500 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Search size={22} className="stroke-[3]" />
                            <span className="hidden md:inline">Rechercher</span>
                        </button>
                    </form>
                </div>

                {/* Quick actions/Stats */}
                <div className="pt-8 flex flex-col sm:flex-row gap-6 text-white text-sm font-medium">
                    <span className="flex items-center gap-2 drop-shadow-md">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        + de 10 000 annonces vérifiées
                    </span>
                    <span className="flex items-center gap-2 drop-shadow-md">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Alerte email en temps réel
                    </span>
                    <span className="flex items-center gap-2 drop-shadow-md">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        Mise en relation directe
                    </span>
                </div>
            </div>
        </section>
    );
}
