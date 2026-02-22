"use client";

import { X } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed md:sticky top-0 left-0 h-full md:h-[calc(100vh-4rem)] w-[280px] bg-white border-r border-gray-100 z-50 md:z-auto transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:top-16 overflow-y-auto p-6
        `}
            >
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <h2 className="font-bold text-xl text-text">Filtres</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                    <section>
                        <h3 className="font-semibold text-text mb-4">Type de bien</h3>
                        <div className="space-y-2">
                            {/* Added 'Chambre' */}
                            {['Appartement', 'Maison', 'Studio', 'Chambre', 'Terrain'].map((type) => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className="text-gray-600 group-hover:text-primary transition-colors">{type}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold text-text mb-4">Budget (FCFA)</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <input type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                <input type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold text-text mb-4">Localisation</h3>
                        <div className="space-y-2">
                            {/* Expanded City List */}
                            {['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Garoua', 'Maroua', 'Bamenda', 'Buea', 'Limbe', 'Ebolowa', 'Ngaoundéré', 'Bertoua'].map((city) => (
                                <label key={city} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className="text-gray-600 group-hover:text-primary transition-colors">{city}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                        Appliquer les filtres
                    </button>
                </div>
            </aside>
        </>
    );
}
