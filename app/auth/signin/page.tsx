"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (res?.error) {
                setError("Email ou mot de passe incorrect.");
            } else {
                router.push("/"); // Redirect to home on success
            }
        } catch (err) {
            setError("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <Link href="/" className="flex items-center text-gray-400 hover:text-gray-600 transition-colors mb-4">
                    <ArrowLeft size={20} className="mr-2" />
                    Retour à l'accueil
                </Link>

                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image src="/logo.png" alt="ImmoDirect" width={60} height={60} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bon retour !</h1>
                    <p className="text-gray-500 mt-2">Connectez-vous pour gérer vos annonces et favoris.</p>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="text-right">
                        <a href="#" className="text-sm text-primary hover:underline">Mot de passe oublié ?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center"
                    >
                        {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                        Se connecter
                    </button>
                </form>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Ou continuer avec</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <button
                        onClick={() => signIn("apple", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.29 3.82-1.29 2.15.15 3.08.97 3.32 1.18-1.84 1.06-2.21 4.56-.21 6.32 1.5 1.32 1.49 3.44.8 4.62-.48.84-1.29 2.09-2.81 1.4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Apple
                    </button>
                </div>

                <p className="text-center text-gray-600">
                    Nouveau sur ImmoDirect ?{" "}
                    <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                        Créer un compte
                    </Link>
                </p>

                <p className="text-center text-xs text-gray-400 mt-4">
                    En continuant, vous acceptez nos <Link href="/legal/cgu" className="underline">CGU</Link> et notre <Link href="/privacy" className="underline">Politique de confidentialité</Link>.
                </p>
            </div>
        </div>
    );
}
