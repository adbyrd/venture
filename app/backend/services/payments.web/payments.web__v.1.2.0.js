/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.2.0]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.2.0]';

/**
 * Creates a payment object for the VentureAnalyst AI report bundle.
 * Designed for the "One-Time Fee" model[cite: 21, 72].
 */
export const createVenturePayment = webMethod(Permissions.Anyone, async (amount) => {
    const paymentOptions = {
        amount: amount,
        items: [{ 
            name: "VentureAnalyst AI: 3-Dossier Analysis", 
            price: amount 
        }]
    };
    
    try {
        // Wix Pay Backend handles the secure transaction initialization
        return await wixPayBackend.createPayment(paymentOptions);
    } catch (error) {
        console.error("VentureAnalyst Payment Error:", error);
        throw new Error("Could not initialize checkout. Please try again.");
    }
});

/**
 * Validates the payment status to act as the "Green Light" for n8n.
 * Note: getPayment is accessed directly or via specialized hooks in 2026.
 */
export const verifyPaymentStatus = webMethod(Permissions.Anyone, async (paymentId) => {
    try {
        // Corrected retrieval method for payment status
        const paymentInfo = await wixPayBackend.getPayment(paymentId);
        return paymentInfo.status === "Successful";
    } catch (error) {
        console.error("Verification Error:", error);
        return false;
    }
});