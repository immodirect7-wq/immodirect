
const CAMPAY_BASE_URL = "https://www.campay.net/api";

export const getCampayToken = async () => {
    try {
        const response = await fetch(`${CAMPAY_BASE_URL}/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: process.env.CAMPAY_USERNAME,
                password: process.env.CAMPAY_PASSWORD,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to get Campay token");
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error("Campay Token Error:", error);
        return null;
    }
};

export const requestPayment = async ({
    amount,
    from,
    description,
    externalReference,
}: {
    amount: string;
    from: string; // Phone number (237...)
    description: string;
    externalReference: string;
}) => {
    const token = await getCampayToken();
    if (!token) throw new Error("Authentication failed");

    try {
        const response = await fetch(`${CAMPAY_BASE_URL}/collect/`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                currency: "XAF",
                from,
                description,
                external_reference: externalReference,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Payment Request Failed:", errText);
            throw new Error("Payment request failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Campay Payment Request Error:", error);
        throw error;
    }
};

export const checkTransactionStatus = async (reference: string) => {
    const token = await getCampayToken();
    if (!token) return null;

    try {
        const response = await fetch(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Check Status Error:", error);
        return null;
    }
}
