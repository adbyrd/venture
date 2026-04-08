/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.3.0]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.3.0]';

export const createVenturePayment = webMethod(Permissions.Anyone, async (amount) => {
    const paymentOptions = {
        amount: Number(amount),
        items: [{ 
            name: "VentureAnalyst AI: 3-Dossier Analysis", 
            price: Number(amount) 
        }]
    };
    
    try {
        console.log(`${VERSION_TAG} Initializing payment for: $${amount}`);
        // This method requires the "Wix Pay" app installed in the Dashboard
        return await wixPayBackend.createPayment(paymentOptions);
    } catch (error) {
        console.error(`${VERSION_TAG} Create Error:`, error);
        throw new Error("Checkout system unavailable. Please contact support.");
    }
});

export const verifyPaymentStatus = webMethod(Permissions.Anyone, async (paymentId) => {
    try {
        const paymentInfo = await wixPayBackend.getPayment(paymentId);
        const isApproved = paymentInfo.status === "Successful";
        const isManualPending = paymentInfo.status === "Pending"; // TESTING ONLY - Remove in production

        return {
            verified: isApproved || isManualPending,
            status: paymentInfo.status,
            paymentMethod: paymentInfo.paymentMethod
        };
    } catch (error) {
        console.error("[Venture Payments] Verification Error:", error);
        return { verified: false, status: "Error" };
    }
});