import Link from "next/link";
import { MapPin, CheckCircle } from "lucide-react";
import TrustBadge from "./TrustBadge";
import ImageCarousel from "./ImageCarousel";

interface ListingCardProps {
    id: string;
    title: string;
    description: string;
    price: number;
    neighborhood: string;
    city: string;
    images: string;
    trustScore: number;
    status: string;
}

export default function ListingCard({ id, title, price, neighborhood, city, images, trustScore, status }: ListingCardProps) {
    let parsedImages: string[] = [];
    try {
        parsedImages = JSON.parse(images);
    } catch (e) {
        parsedImages = [];
    }

    return (
        <Link href={`/listings/${id}`} className="group block h-full">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col border border-gray-100">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    {/* Trust Badge Floating */}
                    <div className="absolute top-3 left-3 z-10">
                        <TrustBadge trustScore={trustScore} />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold shadow-sm">
                        {status === 'PAID' ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> Vérifié
                            </span>
                        ) : (
                            <span className="text-gray-500">En attente</span>
                        )}
                    </div>

                    <div className="w-full h-full relative">
                        <ImageCarousel
                            images={parsedImages}
                            title={title}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-text line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm mb-4">
                        <MapPin size={16} className="mr-1 text-primary" />
                        {neighborhood}, {city}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                            {price.toLocaleString()} <span className="text-sm font-normal text-gray-500">FCFA/mois</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
