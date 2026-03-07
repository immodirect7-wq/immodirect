import crypto from "crypto";

const NOTCHPAY_API_URL = "https://api.notchpay.co";

/**
 * Initialize a payment with NotchPay
 * Returns an authorization_url to redirect the user to
 */
export async function initializePayment({
    amount,
    email,
    currency = "XAF",
    description,
    reference,
    callbackUrl,
}: {
    amount: number;
    email: string;
    currency?: string;
    description: string;
    reference: string;
    callbackUrl: string;
}) {
    const response = await fetch(`${NOTCHPAY_API_URL}/payments`, {
        method: "POST",
        headers: {
            "Authorization": process.env.NOTCHPAY_PUBLIC_KEY || "",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            amount,
            currency,
            email,
            description,
            reference,
            callback: callbackUrl,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("NotchPay Init Error:", errText);
        throw new Error(`NotchPay payment initialization failed: ${errText}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Verify/retrieve a payment by its reference
 */
export async function verifyPayment(reference: string) {
    const response = await fetch(`${NOTCHPAY_API_URL}/payments/${reference}`, {
        method: "GET",
        headers: {
            "Authorization": process.env.NOTCHPAY_PUBLIC_KEY || "",
            "Accept": "application/json",
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("NotchPay Verify Error:", errText);
        return null;
    }

    return await response.json();
}

/**
 * Verify webhook signature using HMAC SHA-256
 * Compares the x-notch-signature header with computed hash
 */
export function verifyWebhookSignature(
    rawBody: string,
    signature: string
): boolean {
    const hash = process.env.NOTCHPAY_HASH || "";
    if (!hash || !signature) return false;

    const computedSignature = crypto
        .createHmac("sha256", hash)
        .update(rawBody)
        .digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(computedSignature),
            Buffer.from(signature)
        );
    } catch {
        return false;
    }
}
