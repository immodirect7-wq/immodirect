"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Menu, X, PlusCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react"; // We'll mock this behavior first or wrap in provider

// Note: To use useSession, this component must be wrapped in a SessionProvider.
// For simplicity in this step, we'll implement direct buttons leading to sign-in.

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    // const { data: session } = useSession(); // Uncomment when Provider is set up

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 h-16 transition-all duration-300">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
                    <Image src="/logo.png" alt="ImmoDirect Logo" width={40} height={40} className="object-contain" />
                    <span>ImmoDirect</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/listings/create"
                        className="bg-primary text-white hover:bg-blue-700 transition-colors px-6 py-2 rounded-full font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
                    >
                        <PlusCircle size={18} />
                        Publier
                    </Link>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Signup */}
                        <Link
                            href="/auth/signup"
                            className="text-primary font-semibold hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                        >
                            Inscription
                        </Link>

                        {/* Login */}
                        <Link
                            href="/auth/signin"
                            className="bg-slate-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <LogIn size={18} />
                            Connexion
                        </Link>
                    </div>

                    {/* Profile Link (Optional if logged in) */}
                    {/* <Link href="/profile" className="..."> ... </Link> */}
                </div>

                <button className="md:hidden text-text" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b py-4 px-4 flex flex-col gap-4 shadow-lg absolute w-full top-16 left-0">
                    <Link
                        href="/auth/signin"
                        onClick={() => setIsOpen(false)}
                        className="bg-slate-900 text-white w-full py-3 rounded-full font-semibold flex justify-center items-center gap-2"
                    >
                        <LogIn size={18} />
                        Connexion / Inscription
                    </Link>

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
