"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
    images: string[];
    title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If no images or invalid format, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                <span>Aucune image</span>
            </div>
        );
    }

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the listing
        e.stopPropagation(); // Prevent Link wrapper from triggering
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    return (
        <div className="relative w-full h-full group/carousel">
            <Image
                src={images[currentIndex]}
                alt={`${title} - Photo ${currentIndex + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Navigation Arrows (Only show if > 1 image) */}
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
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex
                                        ? "bg-white scale-125"
                                        : "bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
