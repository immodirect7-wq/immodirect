import ListingForm from "@/components/ListingForm";

export default function CreateListingPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold text-center mb-6">Publier une annonce</h1>
            <ListingForm />
        </div>
    );
}
