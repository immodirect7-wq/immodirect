"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Filter } from "lucide-react";

interface ClientSidebarWrapperProps {
    mobileTrigger?: boolean;
}

export default function ClientSidebarWrapper({ mobileTrigger }: ClientSidebarWrapperProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (mobileTrigger) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium hover:bg-gray-50"
            >
                <Filter size={16} />
                Filtres
                <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </button>
        );
    }

    return (
        <div className="hidden md:block">
            <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}
