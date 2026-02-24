import prisma from "@/lib/prisma";
import ListingForm from "@/components/ListingForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditListingPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "OWNER") {
        redirect("/");
    }

    const listing = await prisma.listing.findUnique({
        where: { id: params.id }
    });

    if (!listing || listing.ownerId !== user.id) {
        return <div className="text-center p-8">Annonce introuvable ou accès refusé.</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold text-center mb-6">Modifier l'annonce</h1>
            <ListingForm initialData={listing} />
        </div>
    );
}
