"use client";

import Link from "next/link";
import { CheckCircle, Search, Key, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">

                {/* Text Content */}
                <div className="flex-1 space-y-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                        Trouvez votre logement <span className="text-primary">sans intermédiaire</span>.
                    </h1>
                    <p className="text-lg text-slate-600 md:w-3/4">
                        ImmoDirect connecte directement les propriétaires et les locataires.
                        Économisez sur les frais d'agence et visitez en toute confiance.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">100% Vérifié</h3>
                                <p className="text-sm text-slate-500">Propriétaires identifiés.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Search size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Recherche Facile</h3>
                                <p className="text-sm text-slate-500">Filtres précis par quartier.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                <Key size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Direct Propriétaire</h3>
                                <p className="text-sm text-slate-500">Zéro frais de commission.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/listings/create"
                            className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
                        >
                            Publier une annonce
                        </Link>
                        <button
                            className="bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 transition-colors"
                            onClick={() => {
                                document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Voir les offres
                        </button>
                    </div>
                </div>

                {/* Illustration */}
                <div className="flex-1 relative w-full h-[400px] md:h-[500px]">
                    {/* Replace with your generated image or illustration */}
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl overflow-hidden shadow-2xl skew-y-3 transform rotate-2 border-4 border-white">
                        <div className="flex items-center justify-center h-full text-blue-300">
                            <p className="text-2xl font-bold">Illustration Logement</p>
                        </div>
                        {/* 
                           To use a real image, uncomment and place 'hero-image.jpg' in public folder
                           <Image src="/hero-image.jpg" alt="ImmoDirect App" fill className="object-cover" /> 
                        */}
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute bottom-10 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                        <div className="bg-green-500 text-white p-2 rounded-full">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Appartement Validé</p>
                            <p className="text-xs text-slate-500">À l'instant</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
