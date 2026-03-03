"use client";

import Link from "next/link";
import { User, Menu, X, ShieldAlert, LogIn } from "lucide-react";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react"; // We'll mock this behavior first or wrap in provider

// Note: To use useSession, this component must be wrapped in a SessionProvider.
// For simplicity in this step, we'll implement direct buttons leading to sign-in.

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session, status } = useSession();

    return (
        <nav className="absolute top-0 w-full z-50 py-4 transition-all duration-300">
            <div className="container mx-auto px-4 flex items-center justify-between lg:justify-center">

                {/* Desktop Centered Links */}
                <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-900 tracking-wide">
                    <Link href="/" className="hover:text-[#7bc043] transition-colors">ACCUEIL</Link>
                    <Link href="/listings" className="hover:text-[#7bc043] transition-colors">TROUVER UN BIEN</Link>
                    <Link href="/publish" className="hover:text-[#7bc043] transition-colors">VENDRE UN BIEN</Link>
                    <Link href="/publish" className="hover:text-[#7bc043] transition-colors">LOUER UN BIEN</Link>
                    <Link href="/services" className="hover:text-[#7bc043] transition-colors">NOS SERVICES</Link>
                    <Link href="/contact" className="hover:text-[#7bc043] transition-colors">CONTACT</Link>
                </div>

                {/* Optional Subtle Auth/Admin Actions (Right aligned absolutely if needed) */}
                <div className="hidden lg:flex absolute right-8 items-center gap-4 text-xs font-medium text-slate-600">
                    {status === "authenticated" ? (
                        <>
                            {(session?.user as any)?.role === "ADMIN" && (
                                <Link href="/admin" className="hover:text-[#0f3b5e]">Admin</Link>
                            )}
                            <Link href="/profile" className="hover:text-[#0f3b5e]">Mon Compte</Link>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-red-500">Déconnexion</button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin" className="hover:text-[#0f3b5e] flex items-center gap-1"><User size={14} /> Connexion</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden w-full flex justify-between items-center">
                    <span className="font-bold text-lg text-[#0f3b5e]">Menu</span>
                    <button className="text-[#0f3b5e]" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b py-4 px-4 flex flex-col gap-4 shadow-lg absolute w-full top-16 left-0">
                    <div className="flex flex-col gap-2 w-full">
                        {status === "authenticated" ? (
                            <>
                                {(session?.user as any)?.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-orange-50 text-orange-700 w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
                                    >
                                        <ShieldAlert size={18} />
                                        Admin Console
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-slate-100 text-slate-800 w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
                                >
                                    <User size={18} />
                                    Mon Tableau de bord
                                </Link>
                                <button
                                    onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }}
                                    className="bg-red-50 text-red-600 w-full py-3 rounded-xl font-semibold flex justify-center items-center"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <Link
                                    href="/auth/signin"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-slate-100 text-slate-800 w-1/2 py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
                                >
                                    <LogIn size={18} />
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-primary text-white w-1/2 py-3 rounded-xl font-semibold flex justify-center items-center"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/listings/create"
                        className="bg-primary text-white text-center py-3 rounded-full font-semibold shadow-md active:scale-95 transition-transform"
                        onClick={() => setIsOpen(false)}
                    >
                        Publier une annonce
                    </Link>
                    <Link
                        href="/legal/cgu"
                        className="text-gray-500 text-sm p-2 hover:text-text transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        CGU
                    </Link>
                </div>
            )}
        </nav>
    );
}
