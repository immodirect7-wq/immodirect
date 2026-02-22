export default function CGUPage() {
    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation (CGU)</h1>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">1. Objet</h2>
                <p>Les présentes CGU régissent l'utilisation de la plateforme ImmoDirect, permettant la mise en relation directe entre propriétaires et chercheurs de biens immobiliers au Cameroun.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">2. Services Payants</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Propriétaires :</strong> La publication d'une annonce est facturée 5 000 FCFA pour une durée de 30 jours. Aucun remboursement n'est possible une fois l'annonce publiée.</li>
                    <li><strong>Chercheurs :</strong> L'accès aux numéros des propriétaires nécessite un "Pass Visite" facturé 2 000 FCFA pour 30 jours.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">3. Responsabilité</h2>
                <p>ImmoDirect agit uniquement comme intermédiaire technique. Nous ne vérifions pas physiquement les biens. Les utilisateurs sont tenus de faire preuve de vigilance lors des visites.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">4. Données Personnelles (RGPD)</h2>
                <p>Vos données (numéro de téléphone) sont collectées pour le fonctionnement du service. Elles ne sont partagées qu'avec les utilisateurs ayant un Pass valide.</p>
            </section>
        </div>
    );
}
