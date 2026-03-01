"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface ImageCarouselProps {
    images: string[];
    title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // If no images or invalid format, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                <span>Aucune image</span>
            </div>
        );
    }

    const nextImage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const openLightbox = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    return (
        <>
            {/* ---- Carousel normal ---- */}
            <div className="relative w-full h-full group/carousel">
                <Image
                    src={images[currentIndex]}
                    alt={`${title} - Photo ${currentIndex + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onClick={openLightbox}
                />

                {/* Fullscreen button */}
                <button
                    onClick={openLightbox}
                    className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
                    aria-label="Plein écran"
                >
                    <Maximize2 size={16} />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
                            aria-label="Image précédente"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
                            aria-label="Image suivante"
                        >
                            <ChevronRight size={18} />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white scale-125" : "bg-white/50"}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-20">
                        {currentIndex + 1}/{images.length}
                    </div>
                )}
            </div>

            {/* ---- Lightbox plein écran ---- */}
            {lightboxOpen && (
                <LightboxModal
                    images={images}
                    title={title}
                    initialIndex={currentIndex}
                    onClose={closeLightbox}
                />
            )}
        </>
    );
}

function LightboxModal({
    images,
    title,
    initialIndex,
    onClose,
}: {
    images: string[];
    title: string;
    initialIndex: number;
    onClose: () => void;
}) {
    const [index, setIndex] = useState(initialIndex);

    const next = useCallback(() => setIndex((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);
    const prev = useCallback(() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", handler);
        // Prevent body scroll
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [onClose, next, prev]);

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Fermer"
            >
                <X size={24} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm z-10">
                {index + 1} / {images.length}
            </div>

            {/* Main image */}
            <div
                className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto px-12"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={images[index]}
                    alt={`${title} - Photo ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                />
            </div>

            {/* Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors"
                        aria-label="Précédent"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors"
                        aria-label="Suivant"
                    >
                        <ChevronRight size={28} />
                    </button>
                </>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                            className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === index ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-90"}`}
                        >
                            <Image src={img} alt={`Miniature ${i + 1}`} fill className="object-cover" sizes="56px" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
