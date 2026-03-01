"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/** Barre de progression ultrafine en haut de page + fade-in du contenu */
export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const [key, setKey] = useState(pathname);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        // Start progress bar
        setVisible(true);
        setProgress(20);

        timer.current = setTimeout(() => setProgress(60), 80);
        const t2 = setTimeout(() => setProgress(85), 200);
        const t3 = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }, 400);

        // Update key to trigger re-animation of children
        setKey(pathname);

        return () => {
            clearTimeout(timer.current);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [pathname]);

    return (
        <>
            {/* Progress bar */}
            {visible && (
                <div
                    id="nprogress-bar"
                    style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
                />
            )}
            {/* Page content with fade-in */}
            <div key={key} className="page-enter">
                {children}
            </div>
        </>
    );
}
