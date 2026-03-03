"use client";

import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
    const [activeTab, setActiveTab] = useState<"louer" | "acheter">("louer");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    return (
        <section className="relative w-full min-h-[600px] flex flex-col justify-center bg-[#f8f9fa] overflow-hidden pt-20 pb-16">
            {/* Background Image: A brighter, landscape-oriented image of a city/suburb */}
            <div
                className="absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-60 pointer-events-none"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
                    backgroundPosition: 'center 75%' // focus on the landscape
                }}
            >
                {/* A subtle white gradient from the left to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 lg:px-12 flex flex-col h-full">

                {/* Main Hero Content (Text Left, Logo Right) */}
                <div className="flex flex-col lg:flex-row items-center justify-between flex-1 gap-12 lg:gap-8">

                    {/* Left Column: Text & CTA */}
                    <div className="w-full lg:w-[60%] flex flex-col items-start text-left space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black leading-[1.1] tracking-tight">
                            <span className="text-[#0f3b5e]">Trouvez, </span>
                            <span className="text-[#7bc043]">vendez ou</span><br />
                            <span className="text-[#7bc043]">louez</span>
                            <span className="text-[#0f3b5e]"> votre bien sans</span><br />
                            <span className="text-[#0f3b5e]">intermédiaire avec</span><br />
                            <span className="text-[#7bc043]">ImmoDirect.</span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-[#0f3b5e] font-medium max-w-2xl">
                            L'immobilier en direct au Cameroun.
                        </p>

                        <button className="bg-[#7bc043] hover:bg-[#68a834] text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 mt-4">
                            Visitez le Site
                        </button>
                    </div>

                    {/* Right Column: Logo */}
                    <div className="w-full lg:w-[40%] flex justify-center lg:justify-end items-center hidden md:flex">
                        <div className="relative w-[300px] h-[150px] lg:w-[450px] lg:h-[200px] drop-shadow-2xl">
                            <Image
                                src="/logo.png"
                                alt="ImmoDirect Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Search Box - Moved below the main typography to respect the mockup */}
                <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mt-16 border border-white/20">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab("louer")}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "louer" ? "text-primary border-b-4 border-primary bg-blue-50/30" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
                        >
                            Louer
                        </button>
                        <button
                            onClick={() => setActiveTab("acheter")}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "acheter" ? "text-primary border-b-4 border-primary bg-blue-50/30" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
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
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <MapPin className="text-[#7bc043]" size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une ville, un quartier..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-[#0f3b5e] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:bg-[#0a2840] transition-colors flex items-center justify-center gap-2"
                        >
                            <Search size={22} className="stroke-[2]" />
                            <span className="hidden md:inline">Rechercher</span>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
