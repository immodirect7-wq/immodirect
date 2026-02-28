"use client";

import { useState } from "react";
import { User, Home, Heart } from "lucide-react";

interface ProfileTabsProps {
    role: string;
    children: React.ReactNode;
}

export default function ProfileTabs({ role, children }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState("account");

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex border-b mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("account")}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === "account"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <User size={18} />
                    Mon Compte
                </button>

                <button
                    onClick={() => setActiveTab("listings")}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === "listings"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Home size={18} />
                    Mes Annonces
                </button>

                {role === "SEEKER" && (
                    <button
                        onClick={() => setActiveTab("favorites")}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === "favorites"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Heart size={18} />
                        Mes Favoris
                    </button>
                )}

                {role === "SEEKER" && (
                    <button
                        onClick={() => setActiveTab("alerts")}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === "alerts"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        Mes Alertes
                    </button>
                )}
            </div>

            {/* Tab Content Rendering via React.Children based on activeTab */}
            <div className="tab-content">
                {/* 
                  A simple implementation: 
                  Pass a prop `data-tab` to children and filter them. 
                */}
                {Array.isArray(children) ? (
                    children.map((child: any, index) => {
                        if (child?.props?.["data-tab"] === activeTab) {
                            return <div key={index}>{child}</div>;
                        }
                        return null;
                    })
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
